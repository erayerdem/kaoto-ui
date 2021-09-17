import * as React from 'react';
import { Circle, Group, Image, Layer, Line, Stage, Text } from 'react-konva';
import { Grid, GridItem } from '@patternfly/react-core';
import { IStepProps, IViewProps } from '../types';
import createImage from '../utils/createImage';
import useImage from '../utils/useImage';
import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import './Visualization.css';
import Konva from "konva";

interface IVisualization {
  isError?: boolean;
  isLoading?: boolean;
  steps: IStepProps[];
  views: IViewProps[];
}

const CIRCLE_LENGTH = 75;

const URLImage = ({ image }) => {
  const [img]: any = useImage(image.src);

  return (
    <Image
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
    />
  );
};

const Visualization = ({ isError, isLoading, steps, views }: IVisualization) => {
  const yAxis = window.innerHeight / 2;
  const incrementAmt = 100;
  const stepsAsElements: any[] = [];
  const dragUrl = React.useRef();
  const drawerRef = React.createRef<HTMLDivElement>();
  const stageRef = React.useRef<Konva.Stage>(null);

  const [images, setImages]: any = React.useState([]);
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);

  const [selectedStep, setSelectedStep] = React.useState<IStepProps>({
    apiVersion: '',
    icon: '',
    id: '',
    name: '',
    type: ''
  });

  React.useEffect(() => {}, []);

  steps.map((step, index) => {
    let inputStep = {
      ...step,
      data: { label: step.name },
      id: index.toString(),
      position: { x: 300, y: yAxis }
    };

    // Grab the previous step to use for determining position and drawing edges
    const previousStep = stepsAsElements[index - 1];

    /**
     * Determine first & last steps
     * Label as input/output, respectively
     */
    switch (index) {
      case 0:
        // First item in `steps` array
        inputStep.position.x = 100;
        break;
      case steps.length - 1:
      default:
        // Last item & middle steps in `steps` array
        // Extract into common area for last & middle steps
        inputStep.position.x = previousStep.position?.x + incrementAmt;
        break;
    }

    stepsAsElements.push(inputStep);

    return;
  });

  const onDragEnd = e => {
  };

  const imageProps = {
    height: 40,
    width: 40
  };

  const handleClickStep = (e) => {
    if(!e.target.id()) {
      return;
    }

    // Only set state again if the ID is not the same
    if(selectedStep.id !== e.target.id()) {
      setSelectedStep(stepsAsElements[e.target.id()]);
    }

    setIsPanelExpanded(!isPanelExpanded);
  };

  const onExpandPanel = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
  };

  const panelContent = (
      <DrawerPanelContent isResizable
                          id={'right-resize-panel'}
                          defaultSize={'500px'}
                          minSize={'150px'}>
        <DrawerHead>
          <h3 className={'pf-c-title pf-m-2xl'} tabIndex={isPanelExpanded ? 0 : -1} ref={drawerRef}>
            Step Details
          </h3>
          <DrawerActions>
            <DrawerCloseButton onClick={onClosePanelClick}/>
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Grid hasGutter>
            <GridItem span={3}><b>Name</b></GridItem>
            <GridItem span={6}>{selectedStep.name}</GridItem>
            <GridItem span={3} rowSpan={2}><img src={selectedStep.icon} style={{maxWidth: '50%'}} alt={'icon'}/></GridItem>
            <GridItem span={3}><b>Title</b></GridItem>
            <GridItem span={6}>{selectedStep.title}</GridItem>
            <GridItem span={3}><b>Description</b></GridItem>
            <GridItem span={9}>{selectedStep.description}</GridItem>
            <GridItem span={3}><b>Group</b></GridItem>
            <GridItem span={9}>{selectedStep.group}</GridItem>
            <GridItem span={3}><b>API Version</b></GridItem>
            <GridItem span={9}>{selectedStep.apiVersion}</GridItem>
            <GridItem span={3}><b>Kind</b></GridItem>
            <GridItem span={9}>{selectedStep.kind}</GridItem>
            {selectedStep.kameletType && (
              <>
                <GridItem span={3}><b>Kamelet Type</b></GridItem>
                <GridItem span={9}>{selectedStep.kameletType}</GridItem>
              </>
            )}
          </Grid>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );

  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <>
      <img
        alt="lion"
        src="https://konvajs.org/assets/lion.png"
        draggable="true"
        onDragStart={(e: any) => {
          dragUrl.current = e.target.src;
        }}
      />
      <Drawer isExpanded={isPanelExpanded} onExpand={onExpandPanel}>
        <DrawerContent panelContent={panelContent} className={'panelCustom'}>
          <DrawerContentBody>
            <div onDrop={(e: any) => {
              e.preventDefault();
              // register event position
              stageRef.current?.setPointersPositions(e);
              // add image
              setImages(
                images.concat([
                  {
                    ...stageRef.current?.getPointerPosition(),
                    src: dragUrl.current,
                  },
                ])
              );
            }}
                 onDragOver={(e) => e.preventDefault()}>
            <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
              <Layer>
                {images.map((image, idx) => {
                  return <URLImage image={image} key={idx} />;
                })}
                <Group x={100} y={200} onDragEnd={onDragEnd} draggable>
                  <Line
                    points={[
                      100, 0,
                      steps.length * incrementAmt, 0
                    ]}
                    stroke={'black'}
                    strokeWidth={3}
                    lineCap={'round'}
                    lineJoin={'round'}
                  />
                  {stepsAsElements.map((item, index) => {
                    const image = {
                      id: item.id,
                      image: createImage(item.icon),
                      x: item.position.x - (imageProps.width / 2),
                      y: 0 - (imageProps.height / 2),
                      height: imageProps.height,
                      width: imageProps.width
                    };

                    return (
                      <Group key={index}
                             onClick={handleClickStep}
                             onMouseEnter={(e: any) => {
                               // style stage container:
                               const container = e.target.getStage().container();
                               container.style.cursor = "pointer";
                             }}
                             onMouseLeave={(e: any) => {
                               const container = e.target.getStage().container();
                               container.style.cursor = "default";
                             }}
                      >
                        <Circle
                          x={item.position.x}
                          y={0}
                          key={index}
                          name={`${index}`}
                          stroke={index === 0 ? 'rgb(0, 136, 206)' : 'rgb(204, 204, 204)'}
                          fill={'white'}
                          strokeWidth={3}
                          width={CIRCLE_LENGTH}
                          height={CIRCLE_LENGTH}
                        />
                        <Image {...image} />
                        <Text x={item.position.x - (CIRCLE_LENGTH)}
                              y={(CIRCLE_LENGTH / 2) + 10}
                              align={'center'}
                              width={150}
                              fontSize={11}
                              text={item.name}
                        />
                      </Group>
                    )
                  })}
                </Group>
              </Layer>
            </Stage>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export { Visualization };
