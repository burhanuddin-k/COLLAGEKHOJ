pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(
            numToKeepStr: '10',
            artifactNumToKeepStr: '5'
        ))
    }

    environment {
        CI = 'true'
    }

    stages {

        stage('Verify Environment') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "       COLLEGEKHOJ CI ENVIRONMENT"
                    echo "=========================================="

                    echo "Node.js version:"
                    node --version

                    echo "npm version:"
                    npm --version

                    echo "Git version:"
                    git --version

                    echo "=========================================="
                '''
            }
        }

        stage('Verify Project') {
            steps {
                sh '''
                    set -e

                    echo "Checking CollegeKhoj project structure..."

                    test -f frontend/package.json
                    test -f frontend/package-lock.json

                    test -f backend/package.json
                    test -f backend/package-lock.json

                    test -f database/schema.sql

                    echo "✓ Frontend package files found"
                    echo "✓ Backend package files found"
                    echo "✓ Database schema found"

                    echo ""
                    echo "Project structure verified successfully."
                '''
            }
        }

        stage('Frontend CI') {
            steps {
                dir('frontend') {
                    sh '''
                        set -e

                        echo "=========================================="
                        echo "             FRONTEND CI"
                        echo "=========================================="

                        echo "Installing frontend dependencies..."
                        npm ci --no-audit --no-fund

                        echo ""
                        echo "Building frontend..."
                        npm run build

                        echo ""
                        test -f dist/index.html

                        echo "✓ Frontend production build successful"
                        echo "✓ frontend/dist/index.html exists"

                        echo "=========================================="
                    '''
                }
            }
        }

        stage('Backend CI') {
            steps {
                dir('backend') {
                    sh '''
                        set -e

                        echo "=========================================="
                        echo "              BACKEND CI"
                        echo "=========================================="

                        echo "Installing backend dependencies..."
                        npm ci --no-audit --no-fund

                        echo ""
                        echo "✓ Backend dependencies installed"
                        echo "=========================================="
                    '''
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh '''
                        set -e

                        echo "=========================================="
                        echo "            BACKEND TESTS"
                        echo "=========================================="

                        npm test -- --passWithNoTests

                        echo ""
                        echo "✓ Backend tests completed"
                        echo "=========================================="
                    '''
                }
            }
        }

        stage('Final Verification') {
            steps {
                sh '''
                    set -e

                    echo "=========================================="
                    echo "          FINAL VERIFICATION"
                    echo "=========================================="

                    test -f frontend/dist/index.html
                    test -f backend/package.json
                    test -f backend/package-lock.json
                    test -f database/schema.sql

                    echo "✓ Frontend production build"
                    echo "✓ Backend package"
                    echo "✓ Backend lock file"
                    echo "✓ Database schema"

                    echo ""
                    echo "COLLEGEKHOJ CI VERIFICATION PASSED"
                    echo "=========================================="
                '''
            }
        }
    }

    post {

        success {
            echo '''
==============================================
       COLLEGEKHOJ CI PIPELINE SUCCESS
==============================================

✓ Environment verified
✓ Project structure verified
✓ Frontend dependencies installed
✓ Frontend production build successful
✓ Backend dependencies installed
✓ Backend tests completed
✓ Final verification passed

==============================================
'''
        }

        failure {
            echo '''
==============================================
       COLLEGEKHOJ CI PIPELINE FAILED
==============================================

Check the failed stage in the console output.

==============================================
'''
        }

        always {
            echo "Cleaning Jenkins workspace..."
            cleanWs()
        }
    }
}