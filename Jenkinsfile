pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

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
                sh '''
                    echo "Checking project structure..."

                    test -f frontend/package.json
                    test -f backend/package.json
                    test -f backend/Dockerfile
                    test -f database/schema.sql

                    echo "Project structure verified successfully."
                '''
            }
        }

        stage('Check Node & NPM') {
            steps {
                sh '''
                    echo "Node version:"
                    node --version

                    echo "NPM version:"
                    npm --version
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
                        npm run lint
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
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
                        npm run lint
                    '''
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh '''
                        npm test -- --passWithNoTests
                    '''
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh '''
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
                    docker images ${BACKEND_IMAGE}
                '''
            }
        }
    }

    post {
        success {
            echo '''
            ==========================================
            COLLEGEKHOJ CI PIPELINE SUCCESSFUL
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
            COLLEGEKHOJ CI PIPELINE FAILED
            ==========================================
            '''
        }

        always {
            cleanWs()
        }
    }
}