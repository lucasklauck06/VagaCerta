// Regra de status de disponibilidade (RF04). Fonte única da regra no backend:
// listagem (Artur), filtros (Vinicius) e detalhes (Vitor) usam esta função.
// Limite combinado com o grupo: até 20% de vagas livres = "poucas vagas".
// O app repete a regra em src/lib/parking-status.ts para atualizar o badge pelo Realtime;
// se mudar aqui, mudar lá também.
const POUCAS_VAGAS_MAX = 0.2;

function parkingStatus(freeSpots, totalSpots) {
    if (freeSpots <= 0) return 'lotado';
    if (totalSpots > 0 && freeSpots / totalSpots <= POUCAS_VAGAS_MAX) return 'poucas_vagas';
    return 'disponivel';
}

module.exports = parkingStatus;
module.exports.POUCAS_VAGAS_MAX = POUCAS_VAGAS_MAX;

if (require.main === module) {
    const assert = require('node:assert');
    assert.equal(parkingStatus(0, 50), 'lotado');
    assert.equal(parkingStatus(0, 0), 'lotado');
    assert.equal(parkingStatus(1, 40), 'poucas_vagas');
    assert.equal(parkingStatus(10, 50), 'poucas_vagas'); // exatamente 20%
    assert.equal(parkingStatus(11, 50), 'disponivel');
    assert.equal(parkingStatus(50, 50), 'disponivel');
    console.log('parkingStatus.js ok');
}
