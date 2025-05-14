import SmartAgroApp from "../src/SmartAgroApp";
import Head from "next/head";
import { ThemeProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Typography, Box } from "@mui/material";
import theme from "../src/theme";

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>SmartAgro Insights</title>
        <meta name="description" content="Platforma AI dla rolnictwa precyzyjnego" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl">
        <Typography variant="h3" align="center" mt={4} mb={2} color="primary">
          🌾 SmartAgro Insights – Inteligentna Analiza Danych Rolniczych
        </Typography>
        <Typography align="center" mb={4}>
          Wgraj dane z gospodarstwa, a system AI wygeneruje analizę zasiewów, gleby i działania na przyszłość.
        </Typography>
        <Box textAlign="center" mb={4}>
          <img src="/images/laboratorium-gleby.jpg" alt="Laboratorium gleby" style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }} />
        </Box>
        <SmartAgroApp />
      </Container>
    </ThemeProvider>
  );
}
