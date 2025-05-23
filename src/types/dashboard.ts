export interface Template {
    id: string;
    title: string;
    dimensionsText: string;
    width: number;
    height: number;
    iconUrl: string;
  }
  
export interface RecentProject {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: string;
  lastModified: string;
  thumbnailUrl?: string;
  hasInitialImage: boolean;
}
  