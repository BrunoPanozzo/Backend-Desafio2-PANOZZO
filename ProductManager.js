const fs = require('fs')

class ProductManager {

    //variables internas
    #products
    static #lastID_Product = 0

    //constructor
    constructor(pathname) {
        this.#products = []
        this.path = pathname
    }

    Inicializar = async () => {
        this.#products = await this.#readProductsFromFile()
    }

    //métodos internos
    //retornar un ID único para cada producto nuevo
    #getNuevoID = () => {
        ProductManager.#lastID_Product += 1
        const id = ProductManager.#lastID_Product;
        return id
    }

    //validar un string permitiendo solo números y letras
    #soloLetrasYNumeros = (cadena) => {
        return (/^[a-zA-Z0-9]+$/.test(cadena))
    }

    //validar permitiendo solo números
    #soloNumeros = (cadena) => {
        return (/^[0-9]+$/.test(cadena))
    }

    //métodos públicos
    //devolver todo el arreglo de productos
    getProducts = async () => {
        try {
            this.#readProductsFromFile()
            return this.#products
        }
        catch (err) {
            console.log('El archivo no existe, retorno array vacío')
            return []
        }
    }

    //dado un ID buscar en el arreglo de productos un producto con dicho ID, caso contrario devolver msje de error
    getProductById = async (prodId) => {
        const arrayProductsTemp = await this.getProducts()
        const producto = arrayProductsTemp.find(item => item.id === prodId)
        if (producto)
            return producto
        else {
            console.error(`El producto con código \"${prodId}\" no existe`)
            return
        }
    }

    async #readProductsFromFile() {
        //primero leo el archivo de productos
        try {
            const fileProductsContent = await fs.promises.readFile(this.path)
            this.#products = JSON.parse(fileProductsContent)
        }
        catch (err) {
            return []
        }
    }

    async #updateProductsFile() {
        //guardar el arreglo en un archivo
        const fileProductsContent = JSON.stringify(this.#products, null, '\t')
        await fs.promises.writeFile(this.path, fileProductsContent)
    }

    //permite agregar un producto al arreglo de productos inicial si cumple con ciertas validaciones
    addProduct = async (title, description, price, thumbnail, code, stock) => {
        //validar que el campo "title" no esté vacío        
        if (title.trim().length <= 0) {
            console.error("El campo \"title\" es inválido")
            return
        }
        //validar que el campo "description" no esté vacío
        if (description.trim().length <= 0) {
            console.error("El campo \"description\" es inválido")
            return
        }
        //validar que el campo "price" contenga sólo números
        if ((!this.#soloNumeros(price)) || (typeof price != "number")) {
            console.error("El campo \"price\" no es un número")
            return
        }
        //validar que el campo "thumbnail" no esté vacío
        if (thumbnail.trim().length <= 0) {
            console.error("El campo \"thumbnail\" es inválido")
            return
        }
        //validar que el campo "code" contenga sólo números y letras
        const codeAValidar = code.trim()
        if ((codeAValidar.length <= 0) || (!this.#soloLetrasYNumeros(codeAValidar))) {
            console.error("El campo \"code\" es inválido")
            return
        }
        //validar que el campo "stock" contenga sólo números
        if ((!this.#soloNumeros(stock)) || (typeof stock != "number")) {
            console.error("El campo \"stock\" no es un número")
            return
        }

        //antes de agregar el producto, verificar que el campo "code" no se repita
        const producto = this.#products.find(item => item.code === code)
        if (producto) {
            console.error(`No se permite agregar el producto con código \"${code}\" porque ya existe`)
            return
        }

        //si llego a este punto, ya están validados los datos, puedo construir el objeto "producto"
        const product = {
            id: this.#getNuevoID(),
            title,
            description,
            price: Number(price),
            thumbnail,
            code,
            stock: Number(stock)
        }

        this.#products.push(product)

        await this.#updateProductsFile()
    }


    //permite actualizar un producto al arreglo de productos inicial si cumple con ciertas validaciones
    updateProduct = async (product) => {
        //validar que el campo "title" no esté vacío        
        if (product.title.trim().length <= 0) {
            console.error("El campo \"title\" es inválido")
            return
        }
        //validar que el campo "description" no esté vacío
        if (product.description.trim().length <= 0) {
            console.error("El campo \"description\" es inválido")
            return
        }
        //validar que el campo "price" contenga sólo números
        if ((!this.#soloNumeros(product.price)) || (typeof product.price != "number")) {
            console.error("El campo \"price\" no es un número")
            return
        }
        //validar que el campo "thumbnail" no esté vacío
        if (product.thumbnail.trim().length <= 0) {
            console.error("El campo \"thumbnail\" es inválido")
            return
        }
        //validar que el campo "code" contenga sólo números y letras
        const codeAValidar = product.code.trim()
        if ((codeAValidar.length <= 0) || (!this.#soloLetrasYNumeros(codeAValidar))) {
            console.error("El campo \"code\" es inválido")
            return
        }
        //validar que el campo "stock" contenga sólo números
        if ((!this.#soloNumeros(product.stock)) || (typeof product.stock != "number")) {
            console.error("El campo \"stock\" no es un número")
            return
        }

        //antes de actualizar el producto, verificar que el campo "code" que puede venir modificado no sea igual a otros productos ya existentes
        const producto = this.#products.find(item => ((item.code === product.code) && (item.id != product.id)))
        if (producto) {
            console.error(`No se permite modificar el producto con código \"${product.code}\" porque ya existe`)
            return
        }

        const existingProductIdx = this.#products.findIndex(item => item.id === product.id)

        if (existingProductIdx < 0) {
            throw 'Invalid product!'
        }

        // actualizar los datos de ese product en el array
        const productData = { ...this.#products[existingProductIdx], ...product }
        this.#products[existingProductIdx] = productData

        await this.#updateProductsFile()
    }

    //dado un ID eliminar del arreglo de productos un producto con dicho ID, caso contrario devolver msje de error
    deleteProduct = async (idProd) => {
        // const arrayProductsTemp = await this.getProducts()
        const producto = this.#products.find(item => item.id === idProd)
        if (producto) {
            this.#products = this.#products.filter(item => item.id !== idProd)
            await this.#updateProductsFile()
        }
        else {
            console.error(`El producto con código \"${idProd}\" no existe`)
            return
        }
    }
}

//testing de la clase "ProductManager"
testing = async () => {
    const productManager = new ProductManager('./Products.json')

    let products = await productManager.Inicializar()
    console.log(products)

    await productManager.addProduct("producto prueba",
        "Este es un producto prueba",
        200,
        "sin imagen",
        "abc123",
        25)

    let products2 = await productManager.getProducts()
    console.log(products2)

    await productManager.addProduct("producto prueba",
        "Este es un producto prueba",
        200,
        "sin imagen",
        "abc1234",
        25)

    let products3 = await productManager.getProducts()
    console.log(products3)

    let product = await productManager.getProductById(1)
    if (product) console.log(product)

    let product1 = await productManager.getProductById(2)
    if (product1) console.log(product1)

    await productManager.updateProduct({ ...product1, stock: 50, price: 300 })
    let products4 = await productManager.getProducts()
    console.log(products4)

    await productManager.deleteProduct(1)
    let products5 = await productManager.getProducts()
    console.log(products5)

    await productManager.deleteProduct(3)
    let products6 = await productManager.getProducts()
    console.log(products6)
}

testing()
