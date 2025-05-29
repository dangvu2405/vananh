// Función para obtener imágenes de libros desde Google Books API
async function fetchBookImageByTitle(title, author) {
    try {
        const query = encodeURIComponent(`${title} ${author}`);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const imageLinks = data.items[0].volumeInfo.imageLinks;
            // Preferir la imagen en alta resolución, con fallback a la miniatura
            return imageLinks?.thumbnail?.replace('http:', 'https:') || 
                   imageLinks?.smallThumbnail?.replace('http:', 'https:') || 
                   null;
        }
        return null;
    } catch (error) {
        console.error(`Error fetchBookImageByTitle: ${error.message}`);
        return null;
    }
}

// Función para actualizar las imágenes de todos los productos
async function updateAllBookImages(productsArray) {
    const updatedProducts = [...productsArray];
    
    for (let product of updatedProducts) {
        const image = await fetchBookImageByTitle(product.name, product.author);
        if (image) {
            product.imageSrc = image;
        }
        // Esperar un poco entre solicitudes para evitar limitaciones de la API
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return updatedProducts;
}