import { useState, useEffect } from 'react';
import { archiveData, termDefinitions, ClusterData } from '../data/archiveData';

const STANDALONE_STORAGE_KEY = 'archive-term-definitions-v5';
const CLUSTERS_STORAGE_KEY = 'archive-clusters-state-v5';

export function useTerms() {
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedDefs = localStorage.getItem(STANDALONE_STORAGE_KEY);
    if (savedDefs) {
      try {
        setDefinitions({ ...termDefinitions, ...JSON.parse(savedDefs) });
      } catch {
        setDefinitions(termDefinitions);
      }
    } else {
      setDefinitions(termDefinitions);
    }

    const savedClusters = localStorage.getItem(CLUSTERS_STORAGE_KEY);
    if (savedClusters) {
      try {
        const parsed = JSON.parse(savedClusters);
        const merged = archiveData.map((staticAttr) => {
          const stored = parsed.find((p: any) => p.id === staticAttr.id);
          if (stored) {
            return {
              ...staticAttr, // Carry default definitions/styles
              x: typeof stored.x === 'number' ? stored.x : staticAttr.x,
              y: typeof stored.y === 'number' ? stored.y : staticAttr.y,
              radius: typeof stored.radius === 'number' ? stored.radius : staticAttr.radius,
              shapeRatioX: typeof stored.shapeRatioX === 'number' ? stored.shapeRatioX : staticAttr.shapeRatioX,
              shapeRatioY: typeof stored.shapeRatioY === 'number' ? stored.shapeRatioY : staticAttr.shapeRatioY,
              shapeType: stored.shapeType || staticAttr.shapeType || 'circle',
              title: stored.title || staticAttr.title,
              subtopics: stored.subtopics ? stored.subtopics.map((storedSub: any, sIdx: number) => {
                const staticSub = staticAttr.subtopics[sIdx];
                return staticSub 
                  ? { ...staticSub, text: storedSub.text || staticSub.text, color: storedSub.color || staticSub.color } 
                  : { text: storedSub.text, angle: storedSub.angle, distance: storedSub.distance, color: storedSub.color };
              }) : staticAttr.subtopics,
              details: stored.details ? stored.details.map((storedDet: any, dIdx: number) => {
                const staticDet = staticAttr.details[dIdx];
                return staticDet 
                  ? { ...staticDet, text: storedDet.text || staticDet.text, color: storedDet.color || staticDet.color } 
                  : { text: storedDet.text, angle: storedDet.angle, distance: storedDet.distance, color: storedDet.color };
              }) : staticAttr.details,
            };
          }
          return staticAttr;
        });
        setClusters(merged);
      } catch {
        setClusters(archiveData);
      }
    } else {
      setClusters(archiveData);
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed with a debounce to prevent 60fps I/O lag
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(definitions));
    }, 1500);
    return () => clearTimeout(timer);
  }, [definitions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      localStorage.setItem(CLUSTERS_STORAGE_KEY, JSON.stringify(clusters));
    }, 1500);
    return () => clearTimeout(timer);
  }, [clusters, isLoaded]);

  const updateDefinition = (term: string, newDefinition: string) => {
    setDefinitions((prev) => ({
      ...prev,
      [term]: newDefinition,
    }));
  };

  const addSubtopic = (clusterId: string, text: string) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id === clusterId) {
          // generate a naive distance/angle for a new subtopic
          const angle = Math.floor(Math.random() * 360);
          const distance = 150 + Math.floor(Math.random() * 50);
          return {
            ...c,
            subtopics: [...c.subtopics, { text, angle, distance }]
          };
        }
        return c;
      })
    );
  };

  const updateClusterTitle = (clusterId: string, newTitle: string) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, title: newTitle } : c))
    );
  };

  const updateClusterColor = (clusterId: string, newColor: string) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, color: newColor } : c))
    );
  };

  const updateSubtopicColor = (
    clusterId: string,
    topicText: string,
    newColor: string,
    isDetail: boolean
  ) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        if (isDetail) {
          return {
            ...c,
            details: c.details.map((d) =>
              d.text === topicText ? { ...d, color: newColor } : d
            ),
          };
        } else {
          return {
            ...c,
            subtopics: c.subtopics.map((s) =>
              s.text === topicText ? { ...s, color: newColor } : s
            ),
          };
        }
      })
    );
  };

  const updateTopicTitle = (
    clusterId: string,
    oldText: string,
    newText: string,
    isDetail: boolean
  ) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        if (isDetail) {
          return {
            ...c,
            details: c.details.map((d) =>
              d.text === oldText ? { ...d, text: newText } : d
            ),
          };
        } else {
          return {
            ...c,
            subtopics: c.subtopics.map((s) =>
              s.text === oldText ? { ...s, text: newText } : s
            ),
          };
        }
      })
    );

    // If there is an existing definition, migrate it to the new key
    if (definitions[oldText]) {
      setDefinitions((prev) => {
        const next = { ...prev };
        next[newText] = prev[oldText];
        delete next[oldText];
        return next;
      });
    }
  };

  const updateClusterPositionAndRadius = (
    clusterId: string,
    x: number,
    y: number,
    radius: number,
    shapeRatioX?: number,
    shapeRatioY?: number,
    shapeType?: 'circle' | 'rect'
  ) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, x, y, radius, shapeRatioX: shapeRatioX ?? c.shapeRatioX, shapeRatioY: shapeRatioY ?? c.shapeRatioY, shapeType: shapeType ?? c.shapeType } : c))
    );
  };

  const addNewCluster = () => {
    setClusters((prev) => {
      const newId = `custom-cluster-${Date.now()}`;
      return [
        ...prev,
        {
          id: newId,
          title: "НОВАЯ СФЕРА",
          x: 0,
          y: 0,
          radius: 100,
          shapeRatioX: 1.0,
          shapeRatioY: 1.0,
          shapeType: 'circle',
          color: "linear-gradient(135deg, #182848 0%, #4b6cb7 100%)",
          level: 2,
          subtopics: [],
          details: []
        }
      ]
    });
  };

  const deleteCluster = (clusterId: string) => {
    setClusters(prev => prev.filter(c => c.id !== clusterId));
  };

  const resetClustersLayout = () => {
    setClusters((prev) =>
      prev.map((c) => {
        const staticAttr = archiveData.find((a) => a.id === c.id);
        if (staticAttr) {
          return {
            ...c,
            x: staticAttr.x,
            y: staticAttr.y,
            radius: staticAttr.radius,
          };
        }
        return c;
      })
    );
  };

  const arrangeClusterNodes = (clusterId: string, layoutType: 'perimeter' | 'inside' | 'chaotic') => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        
        let subtopics = [...c.subtopics];
        let details = [...c.details];
        const total = subtopics.length + details.length;
        if (total === 0) return c;

        if (layoutType === 'perimeter') {
          const angleStep = 360 / total;
          let index = 0;
          subtopics = subtopics.map(s => ({
            ...s,
            angle: index++ * angleStep,
            distance: c.radius
          }));
          details = details.map(d => ({
            ...d,
            angle: index++ * angleStep,
            distance: c.radius
          }));
        } else if (layoutType === 'inside') {
          const maxDist = c.radius * 0.8;
          subtopics = subtopics.map(s => ({
            ...s,
            angle: Math.random() * 360,
            distance: 20 + Math.random() * maxDist
          }));
          details = details.map(d => ({
            ...d,
            angle: Math.random() * 360,
            distance: 20 + Math.random() * maxDist
          }));
        } else if (layoutType === 'chaotic') {
          subtopics = subtopics.map(s => ({
            ...s,
            angle: Math.random() * 360,
            distance: 50 + Math.random() * (c.radius * 1.5)
          }));
          details = details.map(d => ({
            ...d,
            angle: Math.random() * 360,
            distance: 50 + Math.random() * (c.radius * 1.5)
          }));
        }

        return { ...c, subtopics, details };
      })
    );
  };

  return {
    definitions,
    clusters,
    setClusters,
    isLoaded,
    updateDefinition,
    updateClusterTitle,
    updateClusterColor,
    addSubtopic,
    updateTopicTitle,
    updateSubtopicColor,
    updateClusterPositionAndRadius,
    resetClustersLayout,
    addNewCluster,
    deleteCluster,
    arrangeClusterNodes,
  };
}
