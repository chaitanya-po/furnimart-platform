
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

        
        
        
        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                @echo off
                set "KUBECONFIG=C:\\Users\\chaitanya\\.kube\\config"

                "C:\\Users\\chaitanya\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Kubernetes.kind_Microsoft.Winget.Source_8wekyb3d8bbwe\\kind.exe" load docker-image furnimart-catalog:%BUILD_NUMBER% --name workload-cluster
                if errorlevel 1 exit /b 1

                kubectl --kubeconfig="%KUBECONFIG%" -n furnimart set image deployment/catalog-deployment catalog=furnimart-catalog:%BUILD_NUMBER%
                if errorlevel 1 exit /b 1

                kubectl --kubeconfig="%KUBECONFIG%" -n furnimart rollout status deployment/catalog-deployment --timeout=120s
                if errorlevel 1 exit /b 1
                '''
            }
        }



    }
}
