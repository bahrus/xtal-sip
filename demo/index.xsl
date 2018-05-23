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
            <script type="module">
      import '../node_modules/@polymer/iron-demo-helpers/demo-pages-shared-styles.js';
      import '../node_modules/@polymer/iron-demo-helpers/demo-snippet.js';
    </script>
        <custom-style>
          <style is="custom-style" include="demo-pages-shared-styles"></style>
        </custom-style>
      </head>
      <body>
          <xtal-sip load="xtal-link-preview,paper-input,paper-button"></xtal-sip>
          <xtal-link-preview preview="" href="https://onsen.io"></xtal-link-preview>
          <paper-input hidden=""></paper-input>
          <paper-button hidden="">I am a button</paper-button>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>