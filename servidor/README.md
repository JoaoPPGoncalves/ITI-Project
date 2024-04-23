# Servidor
Servidor que contém uma API rudimentar.

Onde é colocado o servidor, deve ser também criada uma pasta chamada "store", o servidor só funciona em Linux (feito em GO).

## Métodos possíveis:
* GET /files -> método que retorna a listagem de todos os ficheiros na pasta "store"
* POST /files -> método que cria um ficheiro na pasta "store" e encripta o mesmo. Usa como parâmetros (body):
 *  key: chave a utilizar para encriptar o ficheiro,
 * length: número de carateres que o ficheiro deve conter,
 * fileName: nome que o ficheiro deve assumir
* GET /files/{fileId} -> método que desencripta e retorna o respetivo ficheiro. Usa como parâmetro (body):
 * key: chave a utilizar para desencriptar o ficheiro

Servidor está disponível na porta 8080.