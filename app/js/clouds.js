
const fragmentCloudShader = `
uniform sampler2D map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec2 vUv;

void main() {

  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep( fogNear, fogFar, depth );

  gl_FragColor = texture2D( map, vUv );
  gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

}
`
const vertexCloudShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`

window.AFRAME.registerComponent('clouds', {
  schema: {
    start_time: {default: new Date()},
    totalClouds: {default: 800},
    activeCamera: {default: null},
    id: {default: null},
    width: {default: 512},
    height: {default: 512}
  },
  buildClouds: function (scene) {
    let object = this.el.object3D
    var loader = new window.THREE.TextureLoader()
    var texture = loader.load('/images/cloud10.png', scene.render)

    texture.magFilter = window.THREE.LinearMipMapLinearFilter
    texture.minFilter = window.THREE.LinearMipMapLinearFilter
    var fog = new window.THREE.Fog(0xc6dff4, 0, 800)
    let material = new window.THREE.ShaderMaterial({
      uniforms: {
        'map': { type: 't', value: texture },
        'fogColor': { type: 'c', value: fog.color },
        'fogNear': { type: 'f', value: fog.near },
        'fogFar': { type: 'f', value: fog.far }
      },
      vertexShader: vertexCloudShader,
      fragmentShader: fragmentCloudShader,
      depthWrite: false,
      depthTest: false,
      transparent: true
    })
    let geometry = new window.THREE.Geometry()
    var plane = new window.THREE.Mesh(new window.THREE.PlaneGeometry(64, 64))

    for (var i = 0; i < this.data.totalClouds; i++) {
      plane.position.x = Math.random() * 1000 - 500
      plane.position.y = -Math.random() * Math.random() * 200 - 15
      plane.position.z = i
      plane.rotation.z = Math.random() * Math.PI
      plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5
      window.THREE.GeometryUtils.merge(geometry, plane)
    }

    let mesh = new window.THREE.Mesh(geometry, material)
    object.add(mesh)
    mesh = new window.THREE.Mesh(geometry, material)
    mesh.position.z = -this.data.totalClouds
    object.add(mesh)
  },

  init: function () {
    this.buildClouds(this.el.sceneEl)
    this.data.activeCamera = this.el.sceneEl.camera
  },
  tick: function () {
    if (this.data.activeCamera) {
      let position = ((Date.now() - this.data.start_time) * 0.03) % this.data.totalClouds
      this.data.activeCamera.position.x += (this.data.activeCamera.position.x) * 0.01
      this.data.activeCamera.position.y += (this.data.activeCamera.position.y) * 0.01
      this.data.activeCamera.position.z = -position + this.data.totalClouds
    }
  }
})
