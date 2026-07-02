FROM ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
USER root
RUN find /home/computeruse -type f \
    -not -path "/home/computeruse/.pyenv/*" \
    -exec sed -i 's#http://localhost#https://claude-computeruse.fly.dev#g; s#http://127.0.0.1#https://claude-computeruse.fly.dev#g' {} + \
    2>/dev/null || true
USER computeruse
