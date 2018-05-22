<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="wc_patterns">
   <xsl:for-each select="pattern">
      <xsl:variable name="prefix" select="@prefix"/>
      <xsl:variable name="context" select="@context"/>
      <xsl:variable name="ext" select="@ext"/>
      <xsl:variable name="root" select="@root"/>
      <xsl:variable name="version" select="@version"/>
      <xsl:for-each select="*">
        <link rel="preload" as="script">
          <xsl:attribute name="href">
            <xsl:value-of select="$root"/><xsl:value-of select="$context"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/>@<xsl:value-of select="$version"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/>.<xsl:value-of select="$ext"/>
          </xsl:attribute>
        </link>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  </xsl:stylesheet>