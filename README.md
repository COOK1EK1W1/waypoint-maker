# Waypoint Maker

Waypoint Maker is an open-source Next.js project designed to simplify the creation of waypoint missions for autonomous UAVs. With powerful features like waypoint grouping, validation, and a Photoshop-inspired layering system, Waypoint Maker is a tool built for developers and UAV enthusiasts alike.

## Features

- **Grouping and Nesting**: Organize waypoints into subgroups, allowing for reusable and nested mission components.
- **Waypoint Validation**: Ensure missions are valid and flyable with an integrated waypoint check feature.
- **Layering System**: Similar to Photoshop, toggle visibility for layers of waypoints to manage complex missions effectively.

## Getting Started

Follow these steps to set up and run Waypoint Maker locally.

### Prerequisites

- [Bun](https://bun.sh) (A fast JavaScript runtime)
- Node.js (LTS version recommended)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/waypoint-maker.git
   cd waypoint-maker
   ```

2. **Install Dependencies**:
   ```bash
   bun install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root of the project and add any required environment variables. Refer to `.env.example` for a template.

### Running the Application

1. **Start the Development Server**:
   ```bash
   bun dev
   ```

2. **Build for Production**:
   ```bash
   bun build
   ```

3. **Run the Production Build**:
   ```bash
   bun start
   ```

### Testing

Waypoint Maker includes tests to ensure reliability and maintainability.

Run the test suite with:
```bash
bun test
```

## Contributing

Contributions are welcome! If you'd like to contribute to Waypoint Maker, please:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request.

Please ensure your code adheres to the existing style and passes all tests before submitting.

## License

This project is licensed under the [MIT License](LICENSE).

---

Thank you for using Waypoint Maker! If you encounter any issues or have feature requests, feel free to open an issue in the [GitHub repository](https://github.com/yourusername/waypoint-maker).
