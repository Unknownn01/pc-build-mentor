import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PriceHistoryChart = ({ data }) => {
    // Formatando a data para exibir no gráfico (ex: "15/03")
    const formattedData = data.map(item => ({
        price: item.preco,
        date: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));

    if (data.length === 0) return <p style={{color: '#888', textAlign: 'center'}}>Ainda não há histórico para esta peça.</p>;

    return (
        <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
            <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '0.9rem' }}>Variação de Preço (R$)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', color: '#fff' }}
                        itemStyle={{ color: '#5bc3e2' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#5bc3e2" 
                        strokeWidth={2} 
                        dot={{ fill: '#5bc3e2', r: 4 }} 
                        activeDot={{ r: 6 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceHistoryChart;