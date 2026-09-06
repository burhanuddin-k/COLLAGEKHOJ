pipeline {
    agent any

    stages {

        stage('Verify Environment') {
            steps {
                sh '''
                    echo "Checking Node.js..."
                    node --version

                    echo "Checking npm..."
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

        stage('Frontend Lint') {
            steps {
                dir('frontend') {
                    sh '''
                        echo "Running frontend lint..."
                        npm run lint
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

        stage('Backend Lint') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Running backend lint..."
                        npm run lint
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
Backend checks: SUCCESS
==========================================
'''
        }

        failure {
            echo '''
==========================================
 COLLEGEKHOJ CI PIPELINE FAILED
==========================================
Check the failed stage in Console Output.
==========================================
'''
        }

        always {
            cleanWs()
        }
    }
}