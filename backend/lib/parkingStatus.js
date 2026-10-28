// Regra de status de disponibilidade. Mesma regra da tarefa do Artur (limite de 20%).
// ponytail: se a branch do Artur entrar primeiro, manter a dele e apagar este arquivo.
const POUCAS_VAGAS_MAX = 0.2;

module.exports = function parkingStatus(freeSpots, totalSpots) {
    if (freeSpots === 0) return 'lotado';
    if (totalSpots > 0 && freeSpots / totalSpots <= POUCAS_VAGAS_MAX) return 'poucas_vagas';
    return 'disponivel';
};
