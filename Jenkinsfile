pipeline{

    agent {
        docker { image 'python:3.12-bookworm' }
    }

    stages {
        stage('Checkout'){
            steps {
                sh 'echo "Checkout code from repository"'
                sh 'echo "python3 --version"'
            }
        }

    }

}