const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Populando banco com 25 builds selecionadas...");

    const builds = [
        // --- CATEGORIA: JOGOS ---
        { nome: "PC Gamer Start - 1080p Low", uso: "Jogos", cpu: "i3", gpu: "GTX 1650", ram: "8GB", mobo: "H610" },
        { nome: "PC Gamer Competitive - High FPS", uso: "Jogos", cpu: "Ryzen 5", gpu: "RTX 3050", ram: "16GB", mobo: "A520" },
        { nome: "PC Gamer Ultra - Ray Tracing", uso: "Jogos", cpu: "i5", gpu: "RTX 4060", ram: "16GB", mobo: "B660" },
        { nome: "PC Gamer Enthusiast - 1440p", uso: "Jogos", cpu: "Ryzen 7", gpu: "RTX 4070", ram: "32GB", mobo: "B550" },
        { nome: "PC Gamer God Mode - 4K", uso: "Jogos", cpu: "i9", gpu: "RTX 4080", ram: "32GB", mobo: "Z790" },

        // --- CATEGORIA: EDIÇÃO DE VÍDEO ---
        { nome: "Editor iniciante Youtube", uso: "Edição de Vídeo", cpu: "i5", gpu: "GTX 1660", ram: "16GB", mobo: "B660" },
        { nome: "Workstation Premiere Pro", uso: "Edição de Vídeo", cpu: "Ryzen 7", gpu: "RTX 3060", ram: "32GB", mobo: "B550" },
        { nome: "Studio 4K Production", uso: "Edição de Vídeo", cpu: "i7", gpu: "RTX 4070", ram: "32GB", mobo: "H770" },
        { nome: "Professional Color Grading", uso: "Edição de Vídeo", cpu: "Ryzen 9", gpu: "RTX 4080", ram: "64GB", mobo: "X670" },
        { nome: "Cinema Master 8K", uso: "Edição de Vídeo", cpu: "i9", gpu: "RTX 4090", ram: "128GB", mobo: "Z790" },

        // --- CATEGORIA: TRABALHO/ESCRITÓRIO ---
        { nome: "Office Home Basic", uso: "Trabalho/Escritório", cpu: "i3", gpu: "Integrated", ram: "8GB", mobo: "H610" },
        { nome: "Corporate Multitask", uso: "Trabalho/Escritório", cpu: "Ryzen 5", gpu: "Integrated", ram: "16GB", mobo: "B450" },
        { nome: "Business Pro Station", uso: "Trabalho/Escritório", cpu: "i5", gpu: "RTX 3050", ram: "16GB", mobo: "B660" },
        { nome: "Executive Performance", uso: "Trabalho/Escritório", cpu: "i7", gpu: "RTX 4060", ram: "32GB", mobo: "H770" },
        { nome: "Server Management Host", uso: "Trabalho/Escritório", cpu: "Ryzen 7", gpu: "RTX 3060", ram: "32GB", mobo: "X570" },

        // --- CATEGORIA: MODELAGEM 3D ---
        { nome: "3D Student Starter", uso: "Modelagem 3D", cpu: "i5", gpu: "RTX 3060", ram: "16GB", mobo: "B660" },
        { nome: "Architectural Render", uso: "Modelagem 3D", cpu: "Ryzen 7", gpu: "RTX 4060 Ti", ram: "32GB", mobo: "B550" },
        { nome: "VFX Production Rig", uso: "Modelagem 3D", cpu: "i7", gpu: "RTX 4070 Ti", ram: "32GB", mobo: "Z790" },
        { nome: "Professional CAD Station", uso: "Modelagem 3D", cpu: "Ryzen 9", gpu: "RTX 4080", ram: "64GB", mobo: "X670" },
        { nome: "Enterprise Render Farm", uso: "Modelagem 3D", cpu: "i9", gpu: "RTX 4090", ram: "128GB", mobo: "Z790" },

        // --- CATEGORIA: IA/MACHINE LEARNING ---
        { nome: "Data Science Learner", uso: "IA/Machine Learning", cpu: "i5", gpu: "RTX 3060 12GB", ram: "16GB", mobo: "B660" },
        { nome: "ML Training Station", uso: "IA/Machine Learning", cpu: "Ryzen 7", gpu: "RTX 4070", ram: "32GB", mobo: "B550" },
        { nome: "Deep Learning Pro", uso: "IA/Machine Learning", cpu: "i7", gpu: "RTX 4080", ram: "64GB", mobo: "Z790" },
        { nome: "AI Research Powerhouse", uso: "IA/Machine Learning", cpu: "Ryzen 9", gpu: "RTX 4090", ram: "64GB", mobo: "X670" },
        { nome: "Neural Network Master", uso: "IA/Machine Learning", cpu: "i9", gpu: "RTX 4090", ram: "128GB", mobo: "Z790" }
    ];

    try {
        const pecas = await prisma.component.findMany();
        await prisma.buildPronta.deleteMany({});
        console.log("🧹 Tabela limpa. Iniciando busca de IDs...");

        for (const b of builds) {
            const findP = (t, cat) => pecas.find(p => p.categoria === cat && p.nome.toLowerCase().includes(t.toLowerCase())) || pecas.find(p => p.categoria === cat);

            await prisma.buildPronta.create({
                data: {
                    nome: b.nome,
                    uso_principal: b.uso,
                    cpu_id: findP(b.cpu, 'processador').id,
                    gpu_id: findP(b.gpu, 'placa_video').id,
                    placaMae_id: findP(b.mobo, 'placa_mae').id,
                    memoria_id: findP(b.ram, 'memoria_ram').id,
                    armazenamento_id: findP('ssd', 'armazenamento').id,
                    fonte_id: findP('fonte', 'fonte_alimentacao').id,
                    gabinete_id: findP('gabinete', 'gabinete').id,
                    cooler_id: findP('cooler', 'refrigeracao').id,
                    build_image: `imagens_geradas/build_${b.nome.replace(/\s/g, '_').toLowerCase()}.png`
                }
            });
            console.log(`✅ Build [${b.nome}] criada.`);
        }
        console.log("\n✨ Todas as 25 builds foram inseridas com sucesso!");
    } catch (e) { console.error(e); }
}

main().finally(() => prisma.$disconnect());