const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeKabum(url) {
    try {
        console.log(`🔌 Conectando à Kabum: ${url.substring(0, 50)}...`);
        
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 15000
        });

        const $ = cheerio.load(data);
        let precoFinal = null;

        // 🛠️ TENTATIVA 1: Lógica JSON-LD (O que vimos na tua imagem)
        const scripts = $('script[type="application/ld+json"]');
        scripts.each((i, el) => {
            try {
                const json = JSON.parse($(el).html());
                // Procuramos pelo objeto que tem o preço (Schema Product)
                if (json["@type"] === "Product" || json["@graph"]) {
                    const product = json["@graph"] ? json["@graph"].find(item => item["@type"] === "Product") : json;
                    
                    if (product && product.offers) {
                        // A Kabum costuma colocar o preço direto em product.offers.price
                        const offers = product.offers;
                        const price = Array.isArray(offers) ? offers[0].price : offers.price;
                        
                        if (price) {
                            precoFinal = parseFloat(price);
                        }
                    }
                }
            } catch (e) { /* pula blocos de JSON inválidos */ }
        });

        // 🛠️ TENTATIVA 2: Fallback (Seletor Visual)
        if (!precoFinal) {
            const precoTexto = $('h4.priceTag').text() || $('.finalPrice').text();
            if (precoTexto) {
                precoFinal = parseFloat(precoTexto.replace(/[^\d,]/g, '').replace(',', '.'));
            }
        }

        return precoFinal;

    } catch (error) {
        console.error("❌ Erro ao acessar o site:", error.message);
        return null;
    }
}

module.exports = { scrapeKabum };