const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Populando banco com 25 builds selecionadas...");

    const builds = [
        // --- JOGOS ---
        { nome: "PC Gamer Start - 1080p Low", uso: "Jogos", cpu: "Ryzen 5 5600", gpu: "GTX 1050 Ti ", ram: "8GB DDR4", mobo: "A320M" },
        { nome: "PC Gamer Competitive - High FPS", uso: "Jogos", cpu: "Core i5-11400F", gpu: "RX 6500 XT", ram: "16GB DDR4", mobo: "H610" },
        { nome: "PC Gamer Ultra - Ray Tracing", uso: "Jogos", cpu: "Ryzen 5 7600", gpu: "RTX 5060", ram: "16GB DDR4", mobo: "B550M" },
        { nome: "PC Gamer Enthusiast - 1440p", uso: "Jogos", cpu: "Core i5-14600K", gpu: "RX 9070", ram: "32GB DDR5", mobo: "Z790" },
        { nome: "PC Gamer God Mode - 4K", uso: "Jogos", cpu: "Ryzen 7 9800X3D", gpu: "RTX 5090", ram: "32GB DDR5", mobo: "X670" },
    
        // --- EDIÇÃO DE VÍDEO ---
        { nome: "Editor iniciante Youtube", uso: "Edição de Vídeo", cpu: "Core i5-11400F", gpu: "GTX 1660 Super", ram: "16GB DDR4", mobo: "B660" },
        { nome: "Workstation Premiere Pro", uso: "Edição de Vídeo", cpu: "Ryzen 7 5700X", gpu: "RTX 3060", ram: "32GB DDR4", mobo: "B550M" },
        { nome: "Studio 4K Production", uso: "Edição de Vídeo", cpu: "Core i7-14700K", gpu: "RTX 4070", ram: "32GB DDR5", mobo: "Z790" },
        { nome: "Professional Color Grading", uso: "Edição de Vídeo", cpu: "Ryzen 9 7900X", gpu: "RTX 7900 XT", ram: "64GB DDR5", mobo: "X670" },
        { nome: "Cinema Master 8K", uso: "Edição de Vídeo", cpu: "Core i7-14700k", gpu: "RTX 5090", ram: "64GB DDR5", mobo: "Z790" },
    
        // --- TRABALHO/ESCRITÓRIO ---
        { nome: "Office Home Basic", uso: "Trabalho/Escritório", cpu: "Ryzen 3 3200G", gpu: "GT 1030", ram: "8GB DDR4", mobo: "A320M" }, // Adicionei a GT 1030 aqui para evitar erro de GPU nula
        { nome: "Corporate Multitask", uso: "Trabalho/Escritório", cpu: "Core i3-10100F", gpu: "RX 550", ram: "16GB DDR4", mobo: "H610" },
        { nome: "Business Pro Station", uso: "Trabalho/Escritório", cpu: "Ryzen 5 7600", gpu: "RTX 3050", ram: "16GB DDR5", mobo: "B650" },
        { nome: "Executive Performance", uso: "Trabalho/Escritório", cpu: "Core i7-12700K", gpu: "RTX 3060", ram: "32GB DDR4", mobo: "B660" },
        { nome: "Server Management Host", uso: "Trabalho/Escritório", cpu: "Ryzen 7 5800XT", gpu: "RX 6600 XT", ram: "32GB DDR4", mobo: "X570" },
    
        // --- MODELAGEM 3D ---
        { nome: "3D Student Starter", uso: "Modelagem 3D", cpu: "Core i5-12400F", gpu: "RTX 3060", ram: "16GB DDR4", mobo: "B660" },
        { nome: "Architectural Render", uso: "Modelagem 3D", cpu: "Ryzen 7 7700X", gpu: "RTX 4070", ram: "32GB DDR5", mobo: "B650" },
        { nome: "VFX Production Rig", uso: "Modelagem 3D", cpu: "Core i9-12900K", gpu: "RTX 4070", ram: "32GB DDR4", mobo: "Z690" },
        { nome: "Professional CAD Station", uso: "Modelagem 3D", cpu: "Ryzen 9 9900X3D", gpu: "RTX 5080", ram: "64GB DDR5", mobo: "X670" },
        { nome: "Enterprise Render Farm", uso: "Modelagem 3D", cpu: "Core Ultra i9 285k", gpu: "RTX 5090", ram: "64GB DDR5", mobo: "Z790" },
    
        // --- IA/MACHINE LEARNING ---
        { nome: "Data Science Learner", uso: "IA/Machine Learning", cpu: "Core i5-14600K", gpu: "RTX 3060", ram: "16GB DDR5", mobo: "B760" },
        { nome: "ML Training Station", uso: "IA/Machine Learning", cpu: "Ryzen 7 9800X3D", gpu: "RTX 7700 XT", ram: "32GB DDR5", mobo: "X670" },
        { nome: "Deep Learning Pro", uso: "IA/Machine Learning", cpu: "Core i9-13900K", gpu: "RTX 7900 XTX", ram: "64GB DDR5", mobo: "Z790" },
        { nome: "AI Research Powerhouse", uso: "IA/Machine Learning", cpu: "Ryzen 9 9900X3D", gpu: "RTX 5090", ram: "64GB DDR5", mobo: "X670" },
        { nome: "Neural Network Master", uso: "IA/Machine Learning", cpu: "Core i9-14900K", gpu: "RTX 5090", ram: "64GB DDR5", mobo: "Z790" }
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