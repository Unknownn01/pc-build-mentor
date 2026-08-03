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
        let produtoEsgotado = false;

        const scripts = $('script[type="application/ld+json"]');
        scripts.each((i, el) => {
            try {
                const json = JSON.parse($(el).html());
                const candidatos = json["@graph"] 
                    ? json["@graph"].filter(item => item["@type"] === "Product")
                    : (json["@type"] === "Product" ? [json] : []);

                for (const product of candidatos) {
                    // Só considera o bloco se a URL bater com o produto que pedimos
                    // (a Kabum inclui a URL do produto no schema)
                    const urlBate = !product.url || url.includes(product.url) || product.url.includes(url.split('?')[0]);

                    if (urlBate && product.offers) {
                        const offers = product.offers;
                        const offer = Array.isArray(offers) ? offers[0] : offers;

                        // Verifica disponibilidade
                        if (offer.availability && offer.availability.includes('OutOfStock')) {
                            produtoEsgotado = true;
                            continue;
                        }

                        if (offer.price) {
                            precoFinal = parseFloat(offer.price);
                            produtoEsgotado = false;
                            break; // achou o produto certo, para de procurar
                        }
                    }
                }
            } catch (e) { /* pula blocos de JSON inválidos */ }
        });

        // Fallback visual (só tenta se não achou nada estruturado)
        if (!precoFinal && !produtoEsgotado) {
            const precoTexto = $('h4.priceTag').text() || $('.finalPrice').text();
            if (precoTexto) {
                precoFinal = parseFloat(precoTexto.replace(/[^\d,]/g, '').replace(',', '.'));
            }
        }

        if (produtoEsgotado) {
            console.log(`⚠️ Produto esgotado, preço não atualizado.`);
            return null;
        }

        return precoFinal;

    } catch (error) {
        console.error("❌ Erro ao acessar o site:", error.message);
        return null;
    }
}

module.exports = { scrapeKabum };