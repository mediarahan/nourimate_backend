-- Drop existing tables if they exist
DROP TABLE IF EXISTS UserProgram;
DROP TABLE IF EXISTS UserDetail;
DROP TABLE IF EXISTS User;

-- Create User table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phoneNumber VARCHAR(255) UNIQUE,
    accessToken VARCHAR(255),
    refreshToken VARCHAR(255),
    emailToken VARCHAR(255),
    smsToken VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    isDetailFilled BOOLEAN DEFAULT FALSE
);

-- Create UserDetail table
CREATE TABLE UserDetail (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    dob DATE,
    height INT,
    waistSize INT,
    weight INT,
    gender VARCHAR(50),
    allergen VARCHAR(255),
    disease VARCHAR(255),
    user_id INT,
    bmi FLOAT,
    idealWeight INT,
    age INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Create UserProgram table
CREATE TABLE UserProgram (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    ongoingProgram INT NOT NULL DEFAULT 0,
    startDate DATE,
    endDate DATE,
    startWeight INT,
    endWeight INT,
    editCurrentWeightDate DATE NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Create MealHistory table
CREATE TABLE consumed_recipes (
    mealHistoryId INT AUTO_INCREMENT PRIMARY KEY,
    recipeId INT NOT NULL,
    consumedTime TIMESTAMP NOT NULL,
    consumedDate VARCHAR(50),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Create History table
CREATE TABLE history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    calories INT,
    protein INT,
    fat INT,
    carbs INT,
    start_weight INT,
    end_weight INT,
    user_id INT NOT NULL,
    created_at BIGINT NOT NULL
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

