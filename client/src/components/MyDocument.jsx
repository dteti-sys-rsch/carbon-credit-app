import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Function to generate a random certificate number
const generateCertificateNumber = () => {
  return Math.floor(10000 + Math.random() * 90000); // Generates a random number between 10000 and 99999
};

// Function to generate a random carbon offset value
const generateCarbonOffset = () => {
  return (Math.random() * 5).toFixed(2); // Generates a random number between 0.00 and 5.00
};

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    textAlign: "left",
    color: "#3E863D",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    color: "#8DC63F",
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    textAlign: "left",
    color: "#000000",
    marginBottom: 10,
  },
  highlight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3E863D",
  },
  logo: {
    width: 150,
    margin: "20px 0",
  },
  signature: {
    fontSize: 14,
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signatureText: {
    fontSize: 12,
    color: "#000000",
  },
});

// Create Document Component
const MyDocument = ({ recipient }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certificateNumber = generateCertificateNumber();
  const carbonOffsetValue = generateCarbonOffset();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CARBON OFFSET CERTIFICATE</Text>
        <Text style={styles.subtitle}>
          {currentDate} | Certificate Number: {certificateNumber}
        </Text>
        <Text style={styles.text}>Presented to</Text>
        <Text style={styles.highlight}>{recipient}</Text>
        <Text style={styles.text}>for offsetting</Text>
        <Text style={styles.highlight}>
          {carbonOffsetValue} MT of CO2 emissions
        </Text>
        <Text style={styles.text}>
          By offsetting through Sustainable Travel International, you are
          supporting verified carbon offset projects that reduce greenhouse gas
          emissions, mitigate climate change impacts, and lead to healthier
          environments and communities around the globe.
        </Text>
        <View style={styles.signature}>
          <View>
            <Text style={styles.signatureText}>Paloma Zapata</Text>
            <Text style={styles.signatureText}>
              CEO, Sustainable Travel International
            </Text>
          </View>
        </View>
        <Text style={styles.signatureText}>EIN: 37-1461679</Text>
      </Page>
    </Document>
  );
};

export default MyDocument;
