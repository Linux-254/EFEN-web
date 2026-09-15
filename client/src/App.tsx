import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Faqs from "./pages/Faqs";
import Involved from "./pages/Involved";
import InfoPage from "./pages/InfoPage";
import Landing from "./pages/Landing";
import ProjectDetail from "./pages/ProjectDetail";
import Work from "./pages/Work";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/about"} component={About} />
      <Route path={"/work"} component={Work} />
      <Route path={"/work/:slug"} component={ProjectDetail} />
      <Route path={"/involved"} component={Involved} />
      <Route path={"/faqs"} component={Faqs} />
      <Route path={"/safeguarding"} component={InfoPage} />
      <Route path={"/privacy"} component={InfoPage} />
      <Route path={"/manage-efen"} component={Admin} />
      <Route path={"/manage-efen/projects"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
