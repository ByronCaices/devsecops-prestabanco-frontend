pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }
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
        stage('Install dependencies') {
            steps {
                dir('deployment/devsecops-prestabanco-frontend') {
                    sh 'npm install'
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                dir('deployment/devsecops-prestabanco-frontend') {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONARQUBE_TOKEN')]) {
                        withSonarQubeEnv('sonarqube local') {
                            sh '''
                                npx sonar-scanner \
                                  -Dsonar.projectKey=prestabanco-frontend \
                                  -Dsonar.projectName="PrestaBanco Frontend" \
                                  -Dsonar.sources=src \
                                  -Dsonar.host.url=http://sonarqube:9000 \
                                  -Dsonar.login=$SONARQUBE_TOKEN
                            '''
                        }
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
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
                        echo "DB_URL=${DB_URL}" > .env
                        echo "DB_NAME=${DB_NAME}" >> .env
                        echo "DB_USERNAME=${DB_USERNAME}" >> .env
                        echo "DB_PASSWORD=${DB_PASSWORD}" >> .env
                        echo "PDADMIN_USER=${PDADMIN_USER}" >> .env
                        echo "PDADMIN_PASSWORD=${PDADMIN_PASSWORD}" >> .env
                        docker-compose --env-file .env -f docker-compose.yml -p prestabanco down
                        docker-compose --env-file .env -f docker-compose.yml -p prestabanco up -d --no-deps --force-recreate --remove-orphans frontend
                        rm -f .env
                        '''
                    }
                }
            }
        }
    }
}
