pipeline {
    agent {
        docker { 
            image 'python:3.12-bookworm'
            args '-u root'
        }
    }

    environment {
        RELEASE_BASE_DIR = '/var/www/fire-map'
        RELEASES_DIR = "${RELEASE_BASE_DIR}/releases"
        CURRENT_LINK_NAME = 'current'
        SSH_CREDENTIALS_ID = '5cd5330b-b9d4-45f5-8aa3-6f855d4724bc'
        TARGET_USER_HOST = 'deployer@85.215.176.31'
        APP_SERVICE_NAME = 'fastapi-fire-map'
        RELEASES_TO_KEEP = 5
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('Test SSH Agent Step') {
            steps {
                script {
                    echo "Versuche sshagent zu verwenden..."
                    try {
                        sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                            echo "Innerhalb des sshagent-Blocks."
                            sh 'echo "sshagent scheint zu funktionieren."'
                            // Optional: sh 'ssh -V' // Prüfen ob ssh Kommando geht
                        }
                        echo "sshagent Block erfolgreich beendet."
                    } catch (Exception e) {
                        echo "FEHLER beim Aufruf von sshagent: ${e.getMessage()}"
                        error "sshagent Step fehlgeschlagen"
                    }
                }
            }
        }
    }
}