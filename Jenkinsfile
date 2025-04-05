pipeline {
    agent any
    environment {
        DB_URL = "jdbc:postgresql://localhost:5435/PrestaBanco"
        DB_NAME = "PrestaBanco"
    }
    stages {
        stage('Checkout deployment repo') {
            steps {
                dir('deployment') {
                    git branch: 'main', url: 'https://github.com/ByronCaices/devsecops-pep1-deployment.git'
                }
            }
        }
        stage('Checkout frontend repo') {
            steps {
                dir('deployment/devsecops-prestabanco-frontend') {
                    git branch: 'main', url: 'https://github.com/ByronCaices/devsecops-prestabanco-frontend.git'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                // Usamos el mismo project name "prestabanco" para que Compose identifique siempre el mismo grupo de contenedores
                sh 'docker-compose -f deployment/docker-compose.yml -p prestabanco build frontend'
            }
        }
        stage('Deploy Frontend') {
            steps {
                dir('deployment') {
                    withCredentials([
                        string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'PDADMIN_USER', variable: 'PDADMIN_USER'),
                        string(credentialsId: 'PDADMIN_PASSWORD', variable: 'PDADMIN_PASSWORD')
                    ]) {
                        sh '''
                        # Generamos el archivo .env dinámicamente con las credenciales y variables de entorno fijas
                        echo "DB_URL=${DB_URL}" > .env
                        echo "DB_NAME=${DB_NAME}" >> .env
                        echo "DB_USERNAME=${DB_USERNAME}" >> .env
                        echo "DB_PASSWORD=${DB_PASSWORD}" >> .env
                        echo "PDADMIN_USER=${PDADMIN_USER}" >> .env
                        echo "PDADMIN_PASSWORD=${PDADMIN_PASSWORD}" >> .env
                        
                        # Detenemos cualquier contenedor previo
                        docker-compose --env-file .env -f docker-compose.yml -p prestabanco down
                        # Levantamos el contenedor con la nueva imagen
                        docker-compose --env-file .env -f docker-compose.yml -p prestabanco up -d --no-deps --force-recreate --remove-orphans frontend
                        
                        # Eliminamos el archivo .env por seguridad
                        rm -f .env
                        '''
                    }
                }
            }
        }
    }
}
