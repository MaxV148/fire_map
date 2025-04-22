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
        stage('1. Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('2. Build Artifact with UV') {
            steps {
                echo 'Installing uv...'
                sh 'pip install uv'
                dir('./backend'){
                    sh 'uv venv .venv --seed'
                    sh '. .venv/bin/activate && uv sync'
                    sh '. .venv/bin/activate && uv build --out-dir dist/'
                    archiveArtifacts artifacts: 'dist/*.whl', fingerprint: true
                }
  
            }
        }

/*         stage('3. (Optional) Test') {
            steps {
                echo 'Running tests...'
                sh '. .venv/bin/activate && pip install pytest' // Falls nicht in requirements.txt
                sh '. .venv/bin/activate && pytest tests/'
            }
        } */

        stage('4. Deploy to Server') {
            steps {
                script {
                    def artifactPattern = 'backend/dist/*.whl'
                    def artifacts = findFiles(glob: artifactPattern)
                    if (artifacts.length == 0) {
                        error "Build artifact (.whl) not found in ${artifactPattern}"
                    }
                    def artifactPath = artifacts[0].path
                    def artifactName = artifacts[0].name
                    echo "Found artifact: ${artifactName}"

                    def releaseDir = "${env.RELEASES_DIR}/${env.BUILD_NUMBER}"
                    def currentLink = "${env.RELEASE_BASE_DIR}/${env.CURRENT_LINK_NAME}"

                    sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                        echo "Connecting to ${TARGET_USER_HOST}..."

                        // 1. Erstelle das Release-Verzeichnis auf dem Zielserver
                        sh """
                            ssh -o StrictHostKeyChecking=no ${TARGET_USER_HOST} ' \
                                echo "Creating release directory ${releaseDir}..."; \
                                mkdir -p ${releaseDir}; \
                                echo "Directory created."; \
                            '
                        """

                        // 2. Kopiere das Artefakt (Wheel) auf den Zielserver
                        sh """
                            echo "Copying artifact ${artifactName} to ${releaseDir}...";
                            scp -o StrictHostKeyChecking=no ${artifactPath} ${TARGET_USER_HOST}:${releaseDir}/
                            echo "Artifact copied.";
                        """

                        // 3. Führe serverseitige Setup-Schritte aus
                        sh """
                            ssh -o StrictHostKeyChecking=no ${TARGET_USER_HOST} ' \
                                echo "Setting up environment in ${releaseDir}..."; \
                                cd ${releaseDir}; \
                                \
                                echo "Creating Python virtual environment..."; \
                                python3 -m venv .venv; \
                                \
                                echo "Activating virtual environment and installing wheel..."; \
                                source .venv/bin/activate; \
                                pip install --quiet ${artifactName}; \
                                deactivate; \
                                \
                                echo "Copying configuration files (Example)..."; \
                                # FÜGE HIER BEFEHLE ZUM KOPIEREN VON KONFIG-DATEIEN HINZU (z.B. .env)
                                # cp /path/to/shared/config/.env ${releaseDir}/
                                \
                                echo "Running database migrations (Example)..."; \
                                # FÜGE HIER BEFEHLE FÜR DB-MIGRATIONEN HINZU (z.B. mit Alembic)
                                # source .venv/bin/activate; \
                                # alembic upgrade head; \
                                # deactivate; \
                                \
                                echo "Server-side setup for release ${env.BUILD_NUMBER} complete."; \
                            '
                        """

                        // 4. Aktualisiere den 'current' Symlink *atomar* auf das neue Release
                        sh """
                            ssh -o StrictHostKeyChecking=no ${TARGET_USER_HOST} ' \
                                echo "Updating symbolic link ${currentLink} -> ${releaseDir}"; \
                                ln -sfn ${releaseDir} ${currentLink}; \
                                echo "Symbolic link updated."; \
                            '
                        """

                        // 5. Starte den Anwendungs-Service neu
                        sh """
                            ssh -o StrictHostKeyChecking=no ${TARGET_USER_HOST} ' \
                                echo "Restarting application service (${APP_SERVICE_NAME})..."; \
                                # sudo systemctl restart ${APP_SERVICE_NAME}; \
                                echo "Service restart command sent."; \
                            '
                        """

                        echo "Deployment of build ${env.BUILD_NUMBER} completed successfully."

                    } // Ende sshagent
                } // Ende script
            } // Ende steps
        } // Ende stage 'Deploy'

/*stage('5. Cleanup Old Releases') {
             steps {
                script {
                     sshagent(credentials: [SSH_CREDENTIALS_ID]) {
                        echo "Cleaning up old releases on ${TARGET_USER_HOST}, keeping last ${RELEASES_TO_KEEP}..."

                        // 1. Bereite den Remote-Befehl als Groovy-String vor.
                        //    Hier findet die Interpolation der Jenkins-Variablen statt.
                        //    Wir verwenden """...""" für die Groovy-Variable und escapen weiterhin '$' für die Remote-Shell.
                        //    Wir quoten den Pfad für die Remote-Shell mit einfachen Anführungszeichen für Robustheit.
                        def remoteScript = """
                            cd '${env.RELEASES_DIR}' && \\
                            COUNT=\\$(ls -1td . | grep '^[0-9]*\$' | wc -l) && \\
                            if [ "\\\$COUNT" -gt ${RELEASES_TO_KEEP} ]; then \\
                                echo "Found \\\$COUNT releases, keeping ${RELEASES_TO_KEEP}. Deleting old ones..."; \\
                                ls -1td . | grep '^[0-9]*\$' | tail -n +\\$((${RELEASES_TO_KEEP} + 1)) | xargs --no-run-if-empty echo "Deleting:" && \\
                                ls -1td . | grep '^[0-9]*\$' | tail -n +\\$((${RELEASES_TO_KEEP} + 1)) | xargs --no-run-if-empty rm -rf; \\
                                echo "Old releases cleaned up."; \\
                            else \\
                                echo "Found \\\$COUNT releases. No cleanup needed (keeping up to ${RELEASES_TO_KEEP})."; \\
                            fi
                        """ // Ende der Zuweisung zu remoteScript

                        // 2. Baue den finalen ssh-Befehl zusammen.
                        //    Wir übergeben den 'remoteScript' als einzelnes Argument in einfachen Anführungszeichen ('...')
                        //    an ssh, damit die Remote-Shell ihn korrekt interpretiert.
                        //    ${TARGET_USER_HOST} wird hier noch von Groovy interpoliert.
                        def sshCommand = "ssh -o StrictHostKeyChecking=no ${TARGET_USER_HOST} '${remoteScript}'"

                        // 3. Führe den zusammengesetzten Befehl aus.
                        sh sshCommand

                    } // Ende sshagent
                } // Ende script
            } // Ende steps
        } // Ende stage 'Cleanup'*/

    } // Ende stages

    post {
        // Aktionen nach dem Build (Erfolg, Misserfolg, etc.)
        success {
            echo 'Pipeline finished successfully!'
            // Hier könnten Benachrichtigungen (Slack, Mail, etc.) stehen
        }
        failure {
            echo 'Pipeline failed!'
            // Hier könnten Benachrichtigungen stehen
        }
    }
}