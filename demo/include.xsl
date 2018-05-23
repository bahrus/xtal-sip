<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="wc_patterns">
    
    <xsl:if test="system-property('xsl:vendor') = 'Microsoft'">
      <script src="../node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
    </xsl:if>
    <script async="" src="../xtal-sip.js"></script>
  
   <xsl:for-each select="pattern">
      <xsl:variable name="prefix" select="@prefix"/>
      <xsl:variable name="context" select="@context"/>
      <xsl:variable name="ext" select="@ext"/>
      <xsl:variable name="root" select="@root"/>
      <xsl:variable name="version" select="@version"/>
      <xsl:variable name="rel" select="@rel"/>
      <xsl:for-each select="*">
        <xsl:variable name="local_version">
          <xsl:choose>
            <xsl:when test="@version"><xsl:value-of select="@version"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$version"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="link_id">
          <xsl:value-of select="translate($prefix, '-', '_')"/>
          <xsl:value-of select="translate(name(.), '-', '_')"/>
        </xsl:variable>
        <link as="script" rel="{$rel}" id="{$link_id}">
          <xsl:attribute name="href">
            <xsl:value-of select="$root"/><xsl:value-of select="$context"/><xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/>@<xsl:value-of select="$local_version"/>/<xsl:value-of select="$prefix"/><xsl:value-of select="name(.)"/><xsl:value-of select="$ext"/>
          </xsl:attribute>
          <!-- <xsl:attribute name="id"><xsl:value-of select="$link_id"/></xsl:attribute>
          <xsl:attribute name="rel"><xsl:value-of select="$rel"></xsl:attribute> -->
        </link>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  </xsl:stylesheet>