export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Importante para roteamento no lado do cliente
  },
});
