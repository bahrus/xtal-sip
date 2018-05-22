<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html" encoding="utf-8" indent="yes" />
  <!-- <xsl:include href="https://cdn.jsdelivr.net/npm/xtal-sip@0.0.59/demo/include.xsl"/> -->
  <xsl:include href="include.xsl"/>
  <!-- <xsl:include href="https://rawgit.com/bahrus/xtal-sip/master/demo/include.xsl"/> -->
  <xsl:template match="/refs">
    <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
    <html>
      <head>
        <title>xtal-sip demo</title>
        <xsl:apply-templates select="*"/>
      </head>
      <body>
        <h1>
          Hello <xsl:value-of select="system-property('xsl:vendor')"/>
        </h1>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>