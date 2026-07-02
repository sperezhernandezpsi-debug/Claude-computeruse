FROM ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
USER root
COPY fix-urls.sh /usr/local/bin/fix-urls.sh
RUN chmod +x /usr/local/bin/fix-urls.sh
USER computeruse
ENTRYPOINT ["/usr/local/bin/fix-urls.sh"]
