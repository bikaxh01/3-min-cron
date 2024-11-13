pipeline {
    agent any
    stages {
        stage('Cloning Code from GitHub') {
            steps {
                git clone 'https://github.com/bikaxh01/3-min-cron.git'
            }
        }
        stage('Building Docker Image..') {
            steps {
                script {
                    def commitId = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    sh "docker build -t bikaxh01/3-min-cron:${commitId} ."
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    def commitId = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-credentials') {
                        sh "docker tag bikaxh01/3-min-cron:${commitId} bikaxh01/3-min-cron:latest"
                        sh "docker push bikaxh01/3-min-cron:${commitId}"
                        sh 'docker push bikaxh01/3-min-cron:latest'
                    }
                }
            }
        }
    }
}

















