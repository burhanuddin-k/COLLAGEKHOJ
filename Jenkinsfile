pipeline {
    agent any

    stages {

        stage('Verify Environment') {
            steps {
                sh '''
                    echo "Node.js version:"
                    node --version

                    echo "npm version:"
                    npm --version
                '''
            }
        }

        stage('Verify Project') {
            steps {
                sh '''
                    echo "Checking CollegeKhoj project structure..."

                    test -f frontend/package.json
                    test -f backend/package.json
                    test -f database/schema.sql

                    echo "Project structure verified successfully."
                '''
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh '''
                        echo "Installing frontend dependencies..."
                        npm ci
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
                        echo "Building CollegeKhoj frontend..."
                        npm run build
                    '''
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Installing backend dependencies..."
                        npm ci
                    '''
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Running backend tests..."
                        npm test
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '''
==========================================
 COLLEGEKHOJ CI PIPELINE SUCCESS
==========================================
Frontend build: SUCCESS
Backend dependencies: SUCCESS
Backend tests: SUCCESS
==========================================
'''
        }

        failure {
            echo '''
==========================================
 COLLEGEKHOJ CI PIPELINE FAILED
==========================================
Check the failed stage above.
==========================================
'''
        }

        always {
            cleanWs()
        }
    }
}