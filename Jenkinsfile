pipeline {
    agent any

    environment {
        APP_NAME = 'collegekhoj'
        BACKEND_IMAGE = 'collegekhoj-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out CollegeKhoj source code...'
                checkout scm
            }
        }

        stage('Verify Project') {
            steps {
                echo 'Verifying CollegeKhoj project structure...'

                sh '''
                    test -f frontend/package.json
                    test -f backend/package.json
                    test -f backend/Dockerfile
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
                        echo "Building React/Vite frontend..."
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
                        npm test -- --passWithNoTests
                    '''
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Building CollegeKhoj backend Docker image..."

                        docker build \
                            -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                            -t ${BACKEND_IMAGE}:latest \
                            .
                    '''
                }
            }
        }

        stage('Docker Image Check') {
            steps {
                sh '''
                    echo "Checking Docker image..."
                    docker images ${BACKEND_IMAGE}
                '''
            }
        }
    }

    post {

        success {
            echo '''
            ==========================================
            CollegeKhoj CI Pipeline Successful!
            ==========================================
            Frontend build: SUCCESS
            Backend lint:   SUCCESS
            Backend tests:  SUCCESS
            Docker build:   SUCCESS
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
            CollegeKhoj CI Pipeline FAILED
            ==========================================
            Check the Jenkins console output.
            ==========================================
            '''
        }

        always {
            echo 'Cleaning Jenkins workspace...'
            cleanWs()
        }
    }
}