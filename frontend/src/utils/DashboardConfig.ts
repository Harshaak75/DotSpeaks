import { CEOMainDashboard } from "../components/roles/CEO/CEOMainDashboard";
import { ClientDashboard } from "../components/roles/Client/ClientDashboard";
import { CMOMainDashboard } from "../components/roles/CMO/CMOMainDashboard";
import { BrandDeveloperDashboard } from "../components/roles/coo/BrandDeveloper/BrandDeveloperDashboard";
import { TellecallerDashboard } from "../components/roles/coo/BrandDeveloper/TeleCaller/TellecallerDashboard";
import COODashboard from "../components/roles/coo/COODashboardWrapper";
import { BrandHeadDashboard } from "../components/roles/coo/Emp/BrandHead/BrandHeadComponents/BrandHeadDashboard";
import { ContentWriterDashboard } from "../components/roles/coo/Emp/BrandHead/ContentWriter/ContnetWriterDashboard";
import { DigitalMarketerDashboard } from "../components/roles/coo/Emp/BrandHead/DigitalMarketer/DigitalMarketDashboard";
import GDFDashboard from "../components/roles/coo/Emp/BrandHead/GraphicDesigner/GDFDashboard";
import { ProjectManagerDashboard } from "../components/roles/coo/Emp/ProjectManager/ProjectManagerComponents/ProjectManagerDashboard";
import { Unauthorized } from "../components/Unathorized";

export const getDashboardComponent = (role: string) => {
  switch (role.toUpperCase()) {
    case "CEO":
      return CEOMainDashboard;
    case "CMO":
      return CMOMainDashboard;
    case "COO":
      return COODashboard;
    case "CONTENT_WRITER":
      return ContentWriterDashboard;
    case "GFX_DESIGNER":
      return GDFDashboard;
    case "DIGITAL_MARKETER":
      return DigitalMarketerDashboard;
    case "BRAND_HEAD":
      return BrandHeadDashboard; // Assuming BrandHead uses the same dashboard as Digital Marketer
    case "PROJECT_MANAGER":
      return ProjectManagerDashboard;
    case "BRAND_DEVELOPER":
      return BrandDeveloperDashboard;
    case "TELLECALLER":
      return TellecallerDashboard;
    case "CLIENT":
      return ClientDashboard;

    default:
      return Unauthorized;
  }
};
