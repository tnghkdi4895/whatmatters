import * as THREE from "../three.lib/three.module.js";
import { OrbitControls } from "../three.lib/OrbitControls.js";
import { GLTFLoader } from "../three.lib/GLTFLoader.js";

var book0 = {
	name: "완전한 행복",
	width:150,
	height: 210,
	depth: 25,
	weight: 716
}

var iphone = {
	name: "iphone",
	width:150,
	height: 210,
	depth: 25,
	weight: 716
}

var explorerX = 0;
var explorerY = 0;

var beforeTouch = true;
var exploring = false;

class App { 
	constructor() {
		const divContainer = document.querySelector('#webgl-container');
		const width = divContainer.clientWidth;
		const height = divContainer.clientHeight;
		const halfX = width / 2;
		const halfY = height / 2;
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		divContainer.appendChild(renderer.domElement);

		//renderer.outputEncoding = sRGBEncoding;
		//renderer.gammaOutput = true;
		//renderer.gammaFactor = 2.2;
		renderer.shadowMap.enabled = true;
		this._renderer = renderer;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#E2E2E2");

		this._scene = scene;
		this._startTime = new Date();
		this._clock = new THREE.Clock();

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		//this._setupControls();
		this._setupPicking();

		//터치 이벤트
		this._divContainer.addEventListener("touchstart", this._handleStart.bind(this), {passive: false});
		this._divContainer.addEventListener("touchend", this._handleEnd.bind(this), {passive: false});
		this._divContainer.addEventListener("touchmove", this._handleMove.bind(this), {passive: false});
		//윈도우 리사이즈 이벤트
		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		const camera = new THREE.PerspectiveCamera(
			45,
			width / height,
			0.1,
			200
		);
		camera.position.set(0, 0, 40);
		//camera.lookAt(new THREE.Vector3(0, 0, 0));

		this._camera = camera;
		this._scene.add(this._camera);
	}
	_setupLight() {
		const ambientLight = new THREE.AmbientLight(0xBAC6E1, 0.2);
		const hemiLight = new THREE.HemisphereLight("#F2E7DC", "#146551", 0.8);
		this._camera.add(hemiLight);
		this._scene.add(ambientLight);
		//var spotLight = new THREE.SpotLight( 0xffffff, 0.2 );
		//spotLight.position.set( -10, 7, 6.6 );
		//spotLight.angle = 0.4;
		//spotLight.penumbra = 0.05;
		//spotLight.decay = 1;
		//spotLight.distance = 2000;
	  
		//spotLight.castShadow = true;
		//spotLight.shadow.mapSize.width = 2024;
		//spotLight.shadow.mapSize.height = 2024;
		//spotLight.shadow.camera.near = 0.01;
		//spotLight.shadow.  .far = 1;
		//this._scene.add(spotLight);
		//spotLight.target.position.set( 3, 0, - 3 );
		//this._scene.add( spotLight.target );
	}
	_setupModel() {
		this._createTable();
		this._createObjects();
	}
	_createTable() {
		const position = { x: 0, y: -50, z: 0 };
		const attribute = { r1: 40, r2: 40, h: 1, s: 45 };

		const tableGeometry = new THREE.CylinderGeometry(attribute.r1, attribute.r2, attribute.h, attribute.s);
		//tableGeometry.computeVertexNormals();
		const tableMaterial = new THREE.MeshLambertMaterial({ color: 0xF7F3F0 });
		const table = new THREE.Mesh(tableGeometry, tableMaterial);

		table.position.set(position.x, position.y, position.z);

		this._scene.add(table);
	}
	_createObjects() {
		var visibleObject = [];
		var invisibleObjects = [];
		console.log(book0.name);
		//책 book
		//threeJS Section
		var sizeValue = 15;
		const position = { x: 0, y: 0, z: 0 };
		const attribute = {
			w: book0.width / sizeValue,
			h: book0.height / sizeValue,
			d: book0.depth / sizeValue
		};

		const loader = new THREE.TextureLoader();
		const geometry = new THREE.BoxGeometry(attribute.w, attribute.h, attribute.d);

		const urls = [
			"./books/완전한행복/white.jpg",
			"./books/완전한행복/spine.jpg",
			"./books/완전한행복/whiteTopBottom.jpg",
			"./books/완전한행복/whiteTopBottom.jpg",
			"./books/완전한행복/front.jpg",
			"./books/완전한행복/back.jpg"
		]
		const materials = urls.map(url => new THREE.MeshLambertMaterial({ map: loader.load(url) }))

		const book = new THREE.Mesh(geometry, materials);
		book.position.set(position.x, position.y, position.z);

		book.name = "bookObj"
		book.castShadow = true;
		book.receiveShadow = true;

		this._book = book;
		this._scene.add(book);

		visibleObject.push(book);


		//아이폰 iphone
		const gltfLoader = new GLTFLoader();
		const iphoneUrl = './comparisonObjects/scene.gltf'
		gltfLoader.load(
			iphoneUrl,
			(gltf) => {
				const obj3d = gltf.scene;
				obj3d.rotation.y = Math.PI;
				const iphoneScale = 10;
				obj3d.position.set(0, 40, 0);
				obj3d.scale.set(iphoneScale, iphoneScale, iphoneScale);
				obj3d.name = "iphoneObj";
				obj3d.traverse((child) => {
					if (child.isMesh) {
						const url = "./comparisonObjects/textures/Frame 3.jpg"
						let newMat = new THREE.TextureLoader().load(url);
						//newMat.color.convertSRGBToLinear();
						newMat.flipY = false;
						//newMat.encoding = sRGBEncoding;
						child.material.map = newMat;
						child.material.metalness = 0;
						//child.material.roughness = 1;
						child.castShadow = true;
						child.receiveShadow = true;
						//child.material.color = 1;
						
						//child.material.alphaMode = "OPAQUE";
						//child.material.transparent = false;
						//child.material.metalness = 0;
						//child.material.pbrMetallicRoughness.baseColorFactor = 0;
						//child.material.color = 0xff0000;
					}
					//console.log(child);
				})
				this._scene.add(obj3d);
				invisibleObjects.push(obj3d);
			}, function (xhr) {
				// 모델이 로드되는 동안 호출되는 함수
				console.log('OBJLoader: ', xhr.loaded / xhr.total * 100, '% loaded');
			}, function (error) {
				// 모델 로드가 실패했을 때 호출하는 함수
				alert('모델을 로드 중 오류가 발생하였습니다.');
			}
		)

		this._visibleObject = visibleObject;
		this._invisibleObjects = invisibleObjects;


	}
	_zoomFit(object3D, camera) {
		//모델을 화면에 꽉채우기 위한 적당한 거리 구하기
		const box = new THREE.Box3().setFromObject(object3D);
		const sizeBox = box.getSize(new THREE.Vector3()).length();
		const centerBox = box.getCenter(new THREE.Vector3());
		const halfSizeModel = sizeBox * 0.5;
		const halfFov = THREE.Math.degToRad(camera.fov * .5);
		const distance = halfSizeModel / Math.tan(halfFov);
		//모델 중심에서 카메라 위치로 향하는 방향 단위 벡터 계산
		const direction = (new THREE.Vector3()).subVectors(
			camera.position, centerBox).normalize();
		//카메라 위치 = 단위 벡터 방향으로 모델 중심 위치에서 distance 거리에 대한 위치
		const position = direction.multiplyScalar(distance).add(centerBox);
		camera.position.copy(position);
		
		camera.updateProjectionMatrix();
		camera.near = sizeBox / 100;
		camera.far = sizeBox * 100;
		camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
		console.log("camera.position.z", camera.position.z);

	}
	_setupControls() {
		const controls = new OrbitControls(this._camera, this._divContainer);
		//controls.maxPolarAngle = Math.PI / 2;
		//controls.minPolarAngle = -Math.PI / 2;
		controls.enableDamping = true; 
		controls.dampingFactor = 0.03;

		controls.screenSpacePanning = false;

		//controls.minDistance = 150;
		//controls.maxDistance = 300;
	}
	_setupPicking() {
		const raycaster = new THREE.Raycaster();
		this._raycaster = raycaster;
	}

	_handleStart(e) {
		console.log("touchstart!");
		e.preventDefault();
		exploring = false;


	}
	_handleEnd(e) {
		console.log("touchend!");
		//touchmove동안은 책을 터치해도 이벤트가 일어나지 않도록 방지
		if (exploring) {
			return;
		}

		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		//터치 x,y(raycaster)
		const touchXY = {
			x: (e.changedTouches[0].clientX/width) * 2 -1,
			y: -(e.changedTouches[0].clientY / height) * 2 + 1
		}
		this._raycaster.setFromCamera(touchXY, this._camera);  
		
		console.log(this._visibleObject);
		console.log(this._invisibleObjects);

		const tweenTl = gsap.timeline();
		const target = this._raycaster.intersectObjects(this._scene.children);
		console.log(this._invisibleObjects);

		if (target.length > 0) {
			//터치 시 반응 코드
			tweenTl.to(this._visibleObject[0].position, 1.5, { y: -40, ease: "power3.inOut" },0)
				.to(this._invisibleObjects[0].position, 1.5, { y: 0, ease: "power3.inOut" }, 0.5);
			this._changeObj(this._visibleObject[0], this._invisibleObjects[0]);
			
			console.log("TOUCH TARGET POSITION.Y:", target[0].object.position.y);		
			console.log("Touch Object SUCCESS!");

			beforeTouch = false;
			return;
		}

	}
	_changeObj(visibleObj, invisibleObj) {
		//this._scene.remove(visibleObj);
		//this._scene.add(invisibleObj);
		
		this._visibleObject.shift();
		this._visibleObject.push(invisibleObj);
		console.log("Changed! visibleObject:", this._visibleObject[0].name);

		this._invisibleObjects.shift();
		this._invisibleObjects.push(visibleObj);
		console.log("Changed! invisibleObjects:", this._invisibleObjects[0].name);

	}
	_handleMove(e) {
		e.preventDefault();
		exploring = true;

		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const halfX = width / 2;
		const halfY = height / 2;
		//커스텀 카메라 위치지정 용 변수
		var sensitivity = 0.08;
		explorerX = (e.changedTouches[0].clientX - halfX) / 2 * sensitivity;
		explorerY = (e.changedTouches[0].clientY - halfY) / 2 * sensitivity;
		console.log("CAM X: ",this._camera.position.x);
		console.log("CAM Y: ",this._camera.position.y);
		console.log("CAM Z: ",this._camera.position.z);
		
		console.log("touchmove!");
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const halfX = width / 2;
		const halfY = height / 2;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}
	render(time) {

		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}
	update(time) {
		const slowValue = 0.001* 0.3;
		time *= slowValue;
		const startRotationY = 0.3
		//커스텀 카메라 위치지정
		var minCameraXLimit = -30;
		var maxCameraXLimit = 30;
		var minCameraYLimit = -15;
		var maxCameraYLimit = 30;

		//damping이 작아질수록 사용자의 움직임에 대한 카메라 움직임의 저항이 커짐
		var damping = 0.03;
		var resistanceRange = 6

		if (this._camera.position.y < minCameraYLimit + resistanceRange) {
			//카메라 y축 위치를 제한하되 부드럽게 하는 모션
				//y축 위치가 위험범위(resistanceRange) 안에 들어오면 damping 값이 점점 작아지도록(저항이 커지도록) 
			damping *= (this._camera.position.y - minCameraYLimit) * 0.2;
			this._camera.position.x += (explorerX- this._camera.position.x) * damping;
			this._camera.position.y += (-explorerY - this._camera.position.y) * damping;
		} else {
			this._camera.position.x += (explorerX- this._camera.position.x) * damping;
			this._camera.position.y += (-explorerY - this._camera.position.y) * damping;
		}
		
		
		this._camera.position.x = Math.max( minCameraXLimit, Math.min( maxCameraXLimit, this._camera.position.x ) );
		this._camera.position.y = Math.max( minCameraYLimit, Math.min( maxCameraYLimit, this._camera.position.y ) );

		this._camera.lookAt(this._scene.position);

		//물체 회전
		this._scene.traverse((child) => {
			if (child.isMesh) {
				child.rotation.y = startRotationY + time;
			}
		})
		//if (beforeTouch) {
		//	//this._book.rotation.y = 0.3 + time;
		//	this._scene.traverse((child) => {
		//		if (child.isMesh) {
		//			child.rotation.y = startRotationY + time;
		//		}
		//		if (child.name === "iphoneObj") {
		//			//let mat = new THREE.MeshLambertMaterial;
		//			//let color = new THREE.Color(0x146551);
		//			//   mat.color = color;
		//			//child.material = mat;
		//		}
		//	})
			
		//} else {
		//	//const rotationDelta = this._eventTimeStamp - this._startTime;
		//	//const rotationY = startRotationY + rotationDelta * slowValue;
		//	//console.log(rotationY)
		//	const deltaTime = this._clock.getDelta();
		//	//this._scene.traverse((child) => {
		//	//	if (child.isMesh) {
		//	//	child.rotation.y = rotationY;
					
		//	//	}
		//	//})
		//}
		

		this._renderer.render(this._scene, this._camera);
		
	}
}

window.onload = function() {
	new App();
}
