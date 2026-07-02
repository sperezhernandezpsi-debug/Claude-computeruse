FROM ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
USER root
RUN sed -i 's#http://localhost#https://claude-computeruse.fly.dev#g; s#http://127.0.0.1#https://claude-computeruse.fly.dev#g' \
    /home/computeruse/entrypoint.sh \
    /home/computeruse/static_content/index.html \
    /home/computeruse/index.html
USER computeruse
