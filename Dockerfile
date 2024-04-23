#Fazer a imagem do container em ubuntu
FROM ubuntu

#Copiar a pasta /servidor para a pasta /iti do container
COPY /servidor /iti

#expor a porta 8080 para 
#EXPOSE 8080

#Mudar a diretoria a usar para a /iti
WORKDIR /iti

#Adicionar a permissão de executar
RUN chmod +x ./pdfer
#Criar a pasta store
#RUN mkdir store
#Executar o servidor
CMD ["./pdfer"]