---
applyTo: "**"
---

# Coding Standards and Preferences

- Write clear, maintainable, and well-structured code.
- Use descriptive variable, function, and class names.
- Follow the language/framework's idiomatic style and conventions.
- Prefer explicitness over cleverness; optimize for readability.
- Use consistent indentation and whitespace.
- Avoid code duplication; use functions, classes, or modules for reuse.
- Add comments to explain complex logic, assumptions, and intent.
- Write docstrings or documentation for public APIs, functions, and classes.
- Include type annotations where supported (e.g., TypeScript, Python typing).
- Handle errors and edge cases gracefully; validate inputs.
- Write unit tests for new features and bug fixes; use descriptive test names.
- Use version control best practices (atomic commits, clear messages).
- Prioritize security: validate user input, avoid hardcoded secrets, follow OWASP guidelines.
- Create modern user interfaces (UIs) that are intuitive and user-friendly, with great user experience (UX) and performance.
- Use mobile-first design principles, but ensure responsiveness for larger devices.
- Focus on making above-the-fold content be engaging, clear, and fast-loading.
- Optimize for performance whevener possible, but prefer clarity.
- Use environment variables for configuration/secrets.
- Follow DRY (Don't Repeat Yourself), KISS (Keep It Simple), and YAGNI (You Aren't Gonna Need It) principles.
- Ensure cross-platform compatibility where possible.
- Prefer open standards and widely adopted libraries.
- Document setup, build, and deployment steps in README files.
- Communicate assumptions, limitations, and trade-offs in comments or documentation.
- Be inclusive and respectful in code comments and documentation.

# Domain Knowledge

- Understand the project domain and business logic before implementing features.
- Ask clarifying questions if requirements are ambiguous.
- Use domain-specific terminology accurately.
- Follow project-specific architectural patterns and folder structures.

# Collaboration

- Write code that is easy for others to review and maintain.
- Leave TODO/FIXME comments for known issues or improvements.
- Prefer pull requests for significant changes; request reviews when needed.
- Keep dependencies up to date and minimal.

# AI Preferences

- When in doubt, prefer clarity, maintainability, and security.
- Always explain reasoning for non-trivial code or design choices.
- Suggest improvements or alternatives if applicable.
- Respect and extend existing code style and conventions.
- Avoid generating code that is harmful, insecure, or violates privacy.

# Output Formatting

- Use markdown for code snippets and documentation.
- Avoid unnecessary boilerplate; focus on the core logic.
- Use comments to indicate unchanged code regions when showing diffs.

# Testing and Validation

- Ensure code compiles/builds and passes all tests before considering complete.
- Add or update tests for all new features and bug fixes.
- Use mocks/stubs for external dependencies in tests.

# Documentation

- Update documentation and READMEs as features or APIs change.
- Provide usage examples for public APIs and CLI tools.
- Document environment variables and configuration options.

# Accessibility & Internationalization

- Follow accessibility best practices for UI code.
- Use semantic HTML and ARIA attributes where appropriate.
- Support localization/internationalization if relevant.

# Miscellaneous

- Prefer open source licenses and attribution where required.
- Avoid proprietary or closed-source dependencies unless necessary.
- Use TODOs to mark incomplete or future work.
- Be mindful of resource usage (CPU, memory, network).
