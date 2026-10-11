
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                    cd services\\catalog-service
                    python -m pip install --upgrade pip
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Run Tests') {
            steps {
                bat '''
                    cd services\\catalog-service
                    set DATABASE_URL=postgresql+psycopg2://furnimart:furnimart123@localhost:5433/furnimart_test
                    python -m pytest -v
                '''
            }
        }

         stage('Build Docker Image') {
            steps {
                bat '''
                    docker build ^
                      -t furnimart-catalog:%BUILD_NUMBER% ^
                      -t furnimart-catalog:latest ^
                      services\\catalog-service
                '''
            }
        }

        stage ('Deploy to Kubernetes') {
            steps {
                bat '''
                    kind load docker-image furnimart-catalog:%BUILD_NUMBER% --name workshop-cluster
                    kubectl config use-context kind-workshop-cluster
                    kubectl -n furnimart set image deployment/catalog-deployment catalog=furnimart-catalog:%BUILD_NUMBER%
                    kubectl -n furnimart rollout status deployment/catalog-deployment
                '''
            }
        }
    }
}
