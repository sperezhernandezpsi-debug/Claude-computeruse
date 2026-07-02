FROM ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
USER root
RUN echo "=== Buscando archivos con localhost ===" && \
    grep -rl "http://localhost\|http://127.0.0.1" /home/computeruse 2>/dev/null | grep -v pyenv || echo "NINGUNO ENCONTRADO"
RUN find /home/computeruse -type f -not -path "/home/computeruse/.pyenv/*" \
    -exec sed -i 's#http://localhost#https://claude-computeruse.fly.dev#g; s#http://127.0.0.1#https://claude-computeruse.fly.dev#g' {} +
USER computeruse
