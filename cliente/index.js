const axios = require("axios");
const readline = require("readline");

const express = require("express");
const bodyParser = require("body-parser");

const Prometheus = require("prom-client");

const register = new Prometheus.Registry();

register.setDefaultLabels({
  app: "clientHandler",
});

Prometheus.collectDefaultMetrics({ register });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//iniciar servidor express
const app = express();
const port = process.argv[2] || 9999;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//iniciar as métricas do servidor
//let total, readFileSys, readFile, writeFile, generateFile, encryption, decryption;
let totalTotal = 0,
  totalReadFileSystemEntries = 0,
  totalReadFile = 0,
  totalWriteFile = 0,
  totalGenerateFile = 0,
  totalEncryption = 0,
  totalDecryption = 0,
  totalRequests = 0;

//adicionar as métricas par ao prometheus
const cliente_total_tempo = new Prometheus.Gauge({
  name: "cliente_total_tempo",
  help: "Saber qual foi o total de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_read_file_system_entries = new Prometheus.Gauge({
  name: "cliente_total_read_file_system_entries",
  help: "Saber qual foi o tempo de entradas de ficheiro no sistema de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_read_file = new Prometheus.Gauge({
  name: "cliente_total_read_file",
  help: "Saber qual foi o tempo para ler o ficheiro de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_write_file = new Prometheus.Gauge({
  name: "cliente_total_write_file",
  help: "Saber qual foi o tempo para escrever o ficheiro de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_gerar_ficheiro_file = new Prometheus.Gauge({
  name: "cliente_total_gerar_ficheiro_file",
  help: "Saber qual foi o tempo para gerar o ficheiro de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_encriptar_file = new Prometheus.Gauge({
  name: "cliente_total_encriptar_file",
  help: "Saber qual foi o tempo para encriptar o ficheiro de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

const cliente_total_desencriptar_file = new Prometheus.Gauge({
  name: "cliente_total_desencriptar_file",
  help: "Saber qual foi o tempo para desencriptar o ficheiro de tempo em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route", "numberRequest"],
});

//adicionar alguns extra
const http_media_tempo_total = new Prometheus.Gauge({
  name: "http_media_tempo_total",
  help: "Média de tempo total em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route"],
});

const http_min_tempo_total = new Prometheus.Gauge({
  name: "http_min_tempo_total",
  help: "tempo minimo total em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route"],
});

const http_max_tempo_total = new Prometheus.Gauge({
  name: "http_max_tempo_total",
  help: "tempo maximo total em microsegundos que a operação demorou no servidor",
  labelNames: ["method", "route"],
});

//register
register.registerMetric(cliente_total_tempo);
register.registerMetric(cliente_total_read_file_system_entries);
register.registerMetric(cliente_total_read_file);
register.registerMetric(cliente_total_write_file);
register.registerMetric(cliente_total_gerar_ficheiro_file);
register.registerMetric(cliente_total_encriptar_file);
register.registerMetric(cliente_total_desencriptar_file);

register.registerMetric(http_media_tempo_total);
register.registerMetric(http_min_tempo_total);
register.registerMetric(http_max_tempo_total);

//disponibilizar as métricas num endpoint
app.get("/metrics", function (req, res) {
  res.setHeader("Content-Type", register.contentType);

  register.metrics().then((data) => res.status(200).send(data));
});

//para dizer que esta a dar o server e em que porta
app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);

async function makeRequest() {
  rl.question("GET ou POST: ", (method) => {
    if (method.toLowerCase() === "get") {
      rl.question("Qual URL: ", (url) => {
        rl.question("Possui Body(true or false): ", (body) => {
          if (body === "true") {
            rl.question("value: ", (value) => {
              rl.question("numero de vezes: ", async function (nmrVezes) {
                for (i = 0; i < nmrVezes; i++) {
                  let data = {};

                  data.key = value;

                  await axios
                    .get(url, { data })
                    .then(function (response) {
                      let metricas = response.data.metrics;
                      totalTotal += metricas.total;
                      totalReadFileSystemEntries +=
                        metricas.readFileSystemEntries;
                      totalReadFile += metricas.readFile;
                      totalWriteFile += metricas.writeFile;
                      totalGenerateFile += metricas.generateFile;
                      totalEncryption += metricas.encryption;
                      totalDecryption += metricas.decryption;

                      console.log("request made " + i + " !!!!")

                      rl.close();
                    })
                    .catch(function (error) {
                      console.error("Erro:", error);
                      rl.close();
                    });
                }

                cliente_total_tempo
                  .labels({ method: "get", route: url })
                  .set(totalTotal);
                cliente_total_read_file_system_entries
                  .labels({ method: "get", route: url })
                  .set(totalReadFileSystemEntries);
                cliente_total_read_file
                  .labels({ method: "get", route: url })
                  .set(totalReadFile);
                cliente_total_write_file
                  .labels({ method: "get", route: url })
                  .set(totalWriteFile);
                cliente_total_gerar_ficheiro_file
                  .labels({ method: "get", route: url })
                  .set(totalGenerateFile);
                cliente_total_encriptar_file
                  .labels({ method: "get", route: url })
                  .set(totalEncryption);
                cliente_total_desencriptar_file
                  .labels({ method: "get", route: url })
                  .set(totalDecryption);
              });
            });
          } else {
            rl.question("numero de vezes: ", async function (nmrVezes) {
              for (i = 0; i < nmrVezes; i++) {
                await axios
                  .get(url)
                  .then(function (response) {
                    let metricas = response.data.metrics;
                    totalTotal += metricas.total;
                    totalReadFileSystemEntries +=
                      metricas.readFileSystemEntries;
                    totalReadFile += metricas.readFile;
                    totalWriteFile += metricas.writeFile;
                    totalGenerateFile += metricas.generateFile;
                    totalEncryption += metricas.encryption;
                    totalDecryption += metricas.decryption;

                    console.log("request made " + i + " !!!!")

                    rl.close();
                  })
                  .catch(function (error) {
                    console.error("Erro:", error);
                    rl.close();
                  });
              }

              cliente_total_tempo
                .labels({ method: "get", route: url })
                .set(totalTotal);
              cliente_total_read_file_system_entries
                .labels({ method: "get", route: url })
                .set(totalReadFileSystemEntries);
              cliente_total_read_file
                .labels({ method: "get", route: url })
                .set(totalReadFile);
              cliente_total_write_file
                .labels({ method: "get", route: url })
                .set(totalWriteFile);
              cliente_total_gerar_ficheiro_file
                .labels({ method: "get", route: url })
                .set(totalGenerateFile);
              cliente_total_encriptar_file
                .labels({ method: "get", route: url })
                .set(totalEncryption);
              cliente_total_desencriptar_file
                .labels({ method: "get", route: url })
                .set(totalDecryption);
            });
          }
        });
      });
    }

    if (method.toLowerCase() === "post") {
      rl.question("Qual URL: ", (url) => {
        rl.question("numero de vezes: ", async function (nmrVezes) {
          for (i = 0; i < nmrVezes; i++) {
            const postData = {
              key: "1234567891234567",
              length: 200,
              fileName: `${generateRandomName(8)}`,
            };

            await axios
              .post(url, postData)
              .then(function (response) {
                let metricas = response.data.metrics;
                totalTotal += metricas.total;
                totalReadFileSystemEntries += metricas.readFileSystemEntries;
                totalReadFile += metricas.readFile;
                totalWriteFile += metricas.writeFile;
                totalGenerateFile += metricas.generateFile;
                totalEncryption += metricas.encryption;
                totalDecryption += metricas.decryption;

                rl.close();
              })
              .catch(function (error) {
                console.error("Erro:", error);
                rl.close();
              });
          }

          cliente_total_tempo
            .labels({ method: "get", route: url })
            .set(totalTotal);
          cliente_total_read_file_system_entries
            .labels({ method: "get", route: url })
            .set(totalReadFileSystemEntries);
          cliente_total_read_file
            .labels({ method: "get", route: url })
            .set(totalReadFile);
          cliente_total_write_file
            .labels({ method: "get", route: url })
            .set(totalWriteFile);
          cliente_total_gerar_ficheiro_file
            .labels({ method: "get", route: url })
            .set(totalGenerateFile);
          cliente_total_encriptar_file
            .labels({ method: "get", route: url })
            .set(totalEncryption);
          cliente_total_desencriptar_file
            .labels({ method: "get", route: url })
            .set(totalDecryption);
        });
      });
    }
  });
}

const loop = () => {
  rl.question("1.Get\n2.Post\n3.Sair\nInsere um comando: ", (answer) => {
    switch (answer) {
      case "1":
        rl.question("Qual URL: ", (url) => {
          rl.question("Possui Body(true or false): ", (body) => {
            if (body === "true") {
              rl.question("value: ", (value) => {
                rl.question("numero de vezes: ", async function (nmrVezes) {
                  totalRequests += nmrVezes;
                  for (i = 0; i < nmrVezes; i++) {
                    let data = {};

                    data.key = value;

                    await axios
                      .get(url, { data })
                      .then(function (response) {
                        let metricas = response.data.metrics;
                        totalTotal += metricas.total;
                        totalReadFileSystemEntries +=
                          metricas.readFileSystemEntries;
                        totalReadFile += metricas.readFile;
                        totalWriteFile += metricas.writeFile;
                        totalGenerateFile += metricas.generateFile;
                        totalEncryption += metricas.encryption;
                        totalDecryption += metricas.decryption;

                        console.log("request made " + i + " !!!!")
                      })
                      .catch(function (error) {
                        console.error("Erro:", error);
                      });
                  }

                  cliente_total_tempo
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalTotal);
                  cliente_total_read_file_system_entries
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalReadFileSystemEntries);
                  cliente_total_read_file
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalReadFile);
                  cliente_total_write_file
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalWriteFile);
                  cliente_total_gerar_ficheiro_file
                    .labels({ method: "get", route: url, numberRequest: nmrVezes})
                    .set(totalGenerateFile);
                  cliente_total_encriptar_file
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalEncryption);
                  cliente_total_desencriptar_file
                    .labels({ method: "get", route: url, numberRequest: nmrVezes })
                    .set(totalDecryption);

                  console.log("Get terminado, informaçõe sjá estam no metrics");
                  loop();
                });
              });
            } else {
              let min, max;
              rl.question("numero de vezes: ", async function (nmrVezes) {
                totalRequests += nmrVezes;
                for (i = 0; i < nmrVezes; i++) {
                  console.log("request made " + i + " !!!!");

                  await axios
                    .get(url)
                    .then(function (response) {
                      let metricas = response.data.metrics;
                      totalTotal += metricas.total;
                      totalReadFileSystemEntries +=
                        metricas.readFileSystemEntries;
                      totalReadFile += metricas.readFile;
                      totalWriteFile += metricas.writeFile;
                      totalGenerateFile += metricas.generateFile;
                      totalEncryption += metricas.encryption;
                      totalDecryption += metricas.decryption;

                      console.log("request made " + i + " !!!!")

                      if(i===0){
                        min = metricas.total;
                        max = metricas.total;
                      }else{
                        if(metricas.total < min){
                          min = metricas.total;
                        }

                        if(metricas.total > max){
                          max = metricas.total;
                        }
                      }
                    })
                    .catch(function (error) {
                      console.error("Erro:", error);
                    });
                }

                cliente_total_tempo
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalTotal);
                cliente_total_read_file_system_entries
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalReadFileSystemEntries);
                cliente_total_read_file
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalReadFile);
                cliente_total_write_file
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalWriteFile);
                cliente_total_gerar_ficheiro_file
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalGenerateFile);
                cliente_total_encriptar_file
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalEncryption);
                cliente_total_desencriptar_file
                  .labels({ method: "get", route: url, numberRequest: nmrVezes })
                  .set(totalDecryption);

                  http_max_tempo_total.set(max);
                  http_min_tempo_total.set(min);

                  console.log("asdasdasd " + totalRequests);

                console.log("Get terminado, informaçõe sjá estam no metrics");
                loop();
              });
            }
          });
        });
        break;
      case "2":
        rl.question("Qual URL: ", (url) => {
          rl.question("numero de vezes: ", async function (nmrVezes) {
            totalRequests += nmrVezes;
            for (i = 0; i < nmrVezes; i++) {
              const postData = {
                key: "1234567891234567",
                length: 200,
                fileName: `${generateRandomName(8)}`,
              };

              await axios
                .post(url, postData)
                .then(function (response) {
                  let metricas = response.data.metrics;
                  totalTotal += metricas.total;
                  totalReadFileSystemEntries += metricas.readFileSystemEntries;
                  totalReadFile += metricas.readFile;
                  totalWriteFile += metricas.writeFile;
                  totalGenerateFile += metricas.generateFile;
                  totalEncryption += metricas.encryption;
                  totalDecryption += metricas.decryption;

                  console.log("request made " + i + " !!!!")
                })
                .catch(function (error) {
                  console.error("Erro:", error);
                });
            }

            cliente_total_tempo
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalTotal);
            cliente_total_read_file_system_entries
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalReadFileSystemEntries);
            cliente_total_read_file
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalReadFile);
            cliente_total_write_file
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalWriteFile);
            cliente_total_gerar_ficheiro_file
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalGenerateFile);
            cliente_total_encriptar_file
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalEncryption);
            cliente_total_desencriptar_file
              .labels({ method: "post", route: url, numberRequest: nmrVezes })
              .set(totalDecryption);

            console.log("Post terminado, informaçõe sjá estam no metrics");

            loop();
          });
        });
        break;
      case "3":
        console.log("A sair. Servidor continua ligado");
        rl.close();
        break;
      default:
        console.log("Comando não encontrado!");
        loop();
    }
  });
};
loop();

makeRequest();

//para criar ficheiros com nome random
function generateRandomName(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomName = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomName += characters.charAt(randomIndex);
  }

  return randomName;
}
