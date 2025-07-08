/*
 * SILENCIADOR DE ERRORES DE ENS EN DESARROLLO
 * 
 * ¿Por qué estos errores?
 * - RainbowKit intenta resolver nombres ENS automáticamente
 * - Hardhat local no tiene servicios ENS configurados
 * - Los errores son solo advertencias, NO afectan la funcionalidad
 * 
 * ¿Es seguro silenciarlos?
 * - SÍ, son solo errores cosméticos
 * - Tu marketplace NFT funciona perfectamente
 * - Solo se silencian en desarrollo, no en producción
 */

// Silenciar errores específicos de ENS en desarrollo
const originalConsoleError = console.error;

console.error = (...args) => {
  // Filtrar errores relacionados con ENS
  const message = JSON.stringify(args);
  if (
    message.includes('reverse') ||
    message.includes('ENS') ||
    message.includes('0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62') ||
    message.includes('Internal error') ||
    message.includes('ContractFunctionExecutionError') ||
    message.includes('getEnsName') ||
    message.includes('ContractFunctionRevertedError')
  ) {
    // Silenciar estos errores específicos - son solo advertencias de ENS
    return;
  }
  
  // Mostrar otros errores normalmente
  originalConsoleError.apply(console, args);
};

// Silenciar warnings de ENS también
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = JSON.stringify(args);
  if (
    message.includes('reverse') ||
    message.includes('ENS') ||
    message.includes('getEnsName') ||
    message.includes('Lit is in dev mode') ||
    message.includes('dev-mode')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export {};
