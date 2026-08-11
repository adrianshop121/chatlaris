import { createClient } from '@/lib/supabase/client'
import { Product, ProductImage, ProductVariant, ProductTag } from '@/types/database.types'

export interface FullProduct extends Product {
  images?: ProductImage[]
  variants?: ProductVariant[]
  tags?: ProductTag[]
}

// Convert File to Base64 Data URL for persistent storage fallback
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Upload product image to Supabase Storage
export async function uploadProductImage(
  file: File,
  businessId: string,
  productId: string
): Promise<string> {
  const supabase = createClient()
  try {
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `${businessId}/${productId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      console.warn('Supabase storage upload fallback to base64 data URL:', error.message)
      return await fileToBase64(file)
    }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
    return publicUrlData.publicUrl || (await fileToBase64(file))
  } catch (err) {
    console.warn('Storage upload catch fallback to base64:', err)
    return await fileToBase64(file)
  }
}

// Fetch all products for a business
export async function fetchBusinessProducts(businessId: string): Promise<FullProduct[]> {
  const supabase = createClient()

  try {
    const { data: productsData, error: prodErr } = await (supabase as any)
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (prodErr || !productsData || productsData.length === 0) {
      // Return local storage cache if database query is empty/offline
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`chatlaris_products_${businessId}`) || localStorage.getItem('chatlaris_products')
        if (saved) return JSON.parse(saved)
      }
      return []
    }

    const productIds = productsData.map((p: any) => p.id)

    // Fetch images
    const { data: imagesData } = await (supabase as any)
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true })

    // Fetch variants
    const { data: variantsData } = await (supabase as any)
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)

    // Fetch tags
    const { data: tagsData } = await (supabase as any)
      .from('product_tags')
      .select('*')
      .in('product_id', productIds)

    const imagesByProduct: Record<string, ProductImage[]> = {}
    if (imagesData) {
      imagesData.forEach((img: ProductImage) => {
        if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = []
        imagesByProduct[img.product_id].push(img)
      })
    }

    const variantsByProduct: Record<string, ProductVariant[]> = {}
    if (variantsData) {
      variantsData.forEach((v: ProductVariant) => {
        if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = []
        variantsByProduct[v.product_id].push(v)
      })
    }

    const tagsByProduct: Record<string, ProductTag[]> = {}
    if (tagsData) {
      tagsData.forEach((t: ProductTag) => {
        if (!tagsByProduct[t.product_id]) tagsByProduct[t.product_id] = []
        tagsByProduct[t.product_id].push(t)
      })
    }

    const fullProducts: FullProduct[] = productsData.map((p: Product) => ({
      ...p,
      images: imagesByProduct[p.id] || [],
      variants: variantsByProduct[p.id] || [],
      tags: tagsByProduct[p.id] || [],
    }))

    // Update local cache for offline/fast load
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chatlaris_products_${businessId}`, JSON.stringify(fullProducts))
      localStorage.setItem('chatlaris_products', JSON.stringify(fullProducts))
    }

    return fullProducts
  } catch (err) {
    console.error('Fetch business products error:', err)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chatlaris_products_${businessId}`) || localStorage.getItem('chatlaris_products')
      if (saved) return JSON.parse(saved)
    }
    return []
  }
}

// Fetch single product by slug
export async function fetchProductBySlug(slug: string): Promise<FullProduct | null> {
  const supabase = createClient()
  try {
    const { data: prodData } = await (supabase as any)
      .from('products')
      .select('*')
      .ilike('slug', slug)
      .single()

    if (!prodData) return null

    const { data: imagesData } = await (supabase as any)
      .from('product_images')
      .select('*')
      .eq('product_id', prodData.id)
      .order('sort_order', { ascending: true })

    const { data: variantsData } = await (supabase as any)
      .from('product_variants')
      .select('*')
      .eq('product_id', prodData.id)

    return {
      ...prodData,
      images: imagesData || [],
      variants: variantsData || [],
    }
  } catch (err) {
    console.error('Fetch product by slug error:', err)
    return null
  }
}

// Create Product in Supabase
export async function createProductInDb(
  businessId: string,
  productData: Partial<Product>,
  rawImages: { file?: File; storage_path: string; file_name: string; sort_order: number }[],
  rawVariants: Partial<ProductVariant>[],
  rawTags: string[]
): Promise<FullProduct> {
  const supabase = createClient()
  const productId = 'prod_' + Math.random().toString(36).substring(2, 10)

  // 1. Upload Images to Supabase Storage & Get Public URLs
  const uploadedImages: ProductImage[] = []
  for (let i = 0; i < rawImages.length; i++) {
    const imgItem = rawImages[i]
    let finalPath = imgItem.storage_path

    if (imgItem.file) {
      finalPath = await uploadProductImage(imgItem.file, businessId, productId)
    }

    uploadedImages.push({
      id: 'img_' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      business_id: businessId,
      storage_path: finalPath,
      file_name: imgItem.file_name || `photo_${i + 1}.jpg`,
      sort_order: i,
      created_at: new Date().toISOString(),
    })
  }

  const newProductRecord: Product = {
    id: productId,
    business_id: businessId,
    name: productData.name || 'Produk Baru',
    slug: productData.slug || 'produk-baru',
    description: productData.description || '',
    normal_price: productData.normal_price || 0,
    discount_price: productData.discount_price || null,
    stock: productData.stock || 0,
    unit: productData.unit || 'pcs',
    category: productData.category || 'Fashion',
    weight_grams: productData.weight_grams || 500,
    status: productData.status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Insert to Supabase DB
  try {
    await (supabase as any).from('products').insert([newProductRecord])

    if (uploadedImages.length > 0) {
      await (supabase as any).from('product_images').insert(uploadedImages)
    }

    if (rawVariants.length > 0) {
      const variantRows = rawVariants.map((v) => ({
        id: v.id || 'var_' + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        business_id: businessId,
        name: v.name || 'Varian',
        sku: v.sku || null,
        price_override: v.price_override || null,
        stock: v.stock ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      await (supabase as any).from('product_variants').insert(variantRows)
    }

    if (rawTags.length > 0) {
      const tagRows = rawTags.map((t) => ({
        id: 'tag_' + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        business_id: businessId,
        tag: t,
        created_at: new Date().toISOString(),
      }))
      await (supabase as any).from('product_tags').insert(tagRows)
    }
  } catch (dbErr) {
    console.warn('Supabase DB Insert Warning (using local persistence fallback):', dbErr)
  }

  const fullNewProduct: FullProduct = {
    ...newProductRecord,
    images: uploadedImages,
    variants: rawVariants.map((v) => ({
      id: v.id || 'var_' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      business_id: businessId,
      name: v.name || 'Varian',
      sku: v.sku || null,
      price_override: v.price_override || null,
      stock: v.stock ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    tags: rawTags.map((t) => ({
      id: 'tag_' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      business_id: businessId,
      tag: t,
      created_at: new Date().toISOString(),
    })),
  }

  // Update local persistent storage cache
  if (typeof window !== 'undefined') {
    const existing = await fetchBusinessProducts(businessId)
    const updatedList = [fullNewProduct, ...existing.filter((p) => p.id !== productId)]
    localStorage.setItem(`chatlaris_products_${businessId}`, JSON.stringify(updatedList))
    localStorage.setItem('chatlaris_products', JSON.stringify(updatedList))

    // Save image map locally as fallback
    const savedImagesMap = JSON.parse(localStorage.getItem('chatlaris_product_images') || '{}')
    savedImagesMap[productId] = uploadedImages
    localStorage.setItem('chatlaris_product_images', JSON.stringify(savedImagesMap))
  }

  return fullNewProduct
}

// Update Product in Supabase
export async function updateProductInDb(
  productId: string,
  businessId: string,
  productData: Partial<Product>,
  rawImages: { id?: string; file?: File; storage_path: string; file_name: string; sort_order: number }[],
  rawVariants: Partial<ProductVariant>[],
  rawTags: string[]
): Promise<FullProduct> {
  const supabase = createClient()

  // 1. Process Images
  const uploadedImages: ProductImage[] = []
  for (let i = 0; i < rawImages.length; i++) {
    const imgItem = rawImages[i]
    let finalPath = imgItem.storage_path

    if (imgItem.file) {
      finalPath = await uploadProductImage(imgItem.file, businessId, productId)
    }

    uploadedImages.push({
      id: imgItem.id || 'img_' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      business_id: businessId,
      storage_path: finalPath,
      file_name: imgItem.file_name || `photo_${i + 1}.jpg`,
      sort_order: i,
      created_at: new Date().toISOString(),
    })
  }

  const updatedRecord: Partial<Product> = {
    ...productData,
    updated_at: new Date().toISOString(),
  }

  try {
    await (supabase as any).from('products').update(updatedRecord).eq('id', productId)

    // Replace images
    await (supabase as any).from('product_images').delete().eq('product_id', productId)
    if (uploadedImages.length > 0) {
      await (supabase as any).from('product_images').insert(uploadedImages)
    }

    // Replace variants
    await (supabase as any).from('product_variants').delete().eq('product_id', productId)
    if (rawVariants.length > 0) {
      const variantRows = rawVariants.map((v) => ({
        id: v.id || 'var_' + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        business_id: businessId,
        name: v.name || 'Varian',
        sku: v.sku || null,
        price_override: v.price_override || null,
        stock: v.stock ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      await (supabase as any).from('product_variants').insert(variantRows)
    }
  } catch (dbErr) {
    console.warn('Supabase DB Update Warning:', dbErr)
  }

  const fullUpdatedProduct: FullProduct = {
    id: productId,
    business_id: businessId,
    name: productData.name || 'Produk',
    slug: productData.slug || 'produk',
    description: productData.description || '',
    normal_price: productData.normal_price || 0,
    discount_price: productData.discount_price || null,
    stock: productData.stock || 0,
    unit: productData.unit || 'pcs',
    category: productData.category || 'Fashion',
    weight_grams: productData.weight_grams || 500,
    status: productData.status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: uploadedImages,
    variants: rawVariants.map((v) => ({
      id: v.id || 'var_' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      business_id: businessId,
      name: v.name || 'Varian',
      sku: v.sku || null,
      price_override: v.price_override || null,
      stock: v.stock ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }

  if (typeof window !== 'undefined') {
    const existing = await fetchBusinessProducts(businessId)
    const updatedList = existing.map((p) => (p.id === productId ? fullUpdatedProduct : p))
    localStorage.setItem(`chatlaris_products_${businessId}`, JSON.stringify(updatedList))
    localStorage.setItem('chatlaris_products', JSON.stringify(updatedList))

    const savedImagesMap = JSON.parse(localStorage.getItem('chatlaris_product_images') || '{}')
    savedImagesMap[productId] = uploadedImages
    localStorage.setItem('chatlaris_product_images', JSON.stringify(savedImagesMap))
  }

  return fullUpdatedProduct
}

// Delete Product in Supabase
export async function deleteProductInDb(productId: string, businessId: string): Promise<boolean> {
  const supabase = createClient()
  try {
    await (supabase as any).from('products').delete().eq('id', productId)
  } catch (err) {
    console.warn('Supabase DB delete warning:', err)
  }

  if (typeof window !== 'undefined') {
    const existing = await fetchBusinessProducts(businessId)
    const updatedList = existing.filter((p) => p.id !== productId)
    localStorage.setItem(`chatlaris_products_${businessId}`, JSON.stringify(updatedList))
    localStorage.setItem('chatlaris_products', JSON.stringify(updatedList))

    const savedImagesMap = JSON.parse(localStorage.getItem('chatlaris_product_images') || '{}')
    delete savedImagesMap[productId]
    localStorage.setItem('chatlaris_product_images', JSON.stringify(savedImagesMap))
  }

  return true
}
