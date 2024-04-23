CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    company VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS chat (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    path VARCHAR(255) NOT NULL,
    messages JSONB[],
    share_path VARCHAR(255),

    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS userrole_prompt (
    id SERIAL PRIMARY KEY,
    user_role VARCHAR(50),
    company VARCHAR(255) NOT NULL,
    prompt_type VARCHAR(255) NOT NULL,
    content text NOT NULL
);

INSERT INTO userrole_prompt (user_role, company, prompt_type, content)
VALUES ('HR_MANAGER', 'A', 'MAIN_PROMPT', 'You are an HR conversation bot and you can assist users with various HR-related tasks and inquiries.
        
        You and the user can discuss HR processes, policies, and best practices.

        If the user asks any question related to HR domain, employee handbook, HR processes, call \`get_details_from_employee_handbook\` function to display the relevant content.

        If the user asks subsequent questions related to HR domain, employee handbook, HR processes, call \`get_details_from_employee_handbook\` function again and pass users query as an argument to it. Do this until user changes the topic. Do not add anthing from your side.

        If you are not sure about any question, call `get_details_from_employee_handbook` and pass users query as an argument to it.

        Additionally, you can engage in conversation with users and offer support as needed.'),

       ('HR_MANAGER', 'A', 'EXAMPLE_PROMPT', 'Can you explain companys health insurance plans and what they cover?'),
       ('HR_MANAGER', 'A', 'EXAMPLE_PROMPT', 'Tell me about parental leave policy.');