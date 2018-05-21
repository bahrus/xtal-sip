<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/refs">
    <xsl:variable name="cdn1" select="'https://unpkg.com/'"/>
    <html>
      <head>
        <title>xtal-sip demo</title>
          <xsl:for-each select="wc_patterns/pattern">
            <xsl:variable name="prefix" select="@prefix"/>
            <xsl:variable name="context" select="@context"/>
            <xsl:for-each select="tag">
              <link rel="preload" as="script">
                <xsl:attribute name="href">
                  <xsl:value-of select="$cdn1"/><xsl:value-of select="$context"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="@suffix"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="@suffix"/>.<xsl:value-of select="@ext"/>
                </xsl:attribute>
              </link>
            </xsl:for-each>
          </xsl:for-each>
      </head>
      <body>
        <h1>
        
          Hello
        
        </h1>
        
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>