FROM ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
USER root
RUN echo "=== Buscando en TODO el sistema ===" && \
    grep -rl "127.0.0.1:6080\|localhost:8501" / \
    --exclude-dir=proc --exclude-dir=sys --exclude-dir=.pyenv \
    --exclude-dir=node_modules 2>/dev/null || echo "NINGUNO ENCONTRADO"
USER computeruse
