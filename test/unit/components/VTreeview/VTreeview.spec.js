import Vue from 'vue'
import { test } from '@/test'
import VTreeview from '@/components/VTreeview/VTreeview'

const singleRootTwoChildren = [
  { id: 0, name: 'Root', children: [{ id: 1, name: 'Child' }, { id: 2, name: 'Child 2'}]}
]

const threeLevels = [
  { id: 0, name: 'Root', children: [{ id: 1, name: 'Child', children: [{ id: 2, name: 'Grandchild' }] }, { id: 3, name: 'Child' }] }
]

test('VTreeView.ts', ({ mount }) => {
  it('should render items', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: singleRootTwoChildren
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should select all descendants', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: threeLevels,
        selectable: true
      }
    })

    const fn = jest.fn()
    wrapper.vm.$on('change', fn)

    wrapper.find('.v-treeview-node__checkbox')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith([0, 1, 2, 3])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should load children when expanding', async () => {
    const loadChildren = (item) => {
      item.children = [{ id: 1, name: 'Child' }]
    }

    const wrapper = mount(VTreeview, {
      propsData: {
        items: [{ id: 0, name: 'Root', children: [] }],
        loadChildren
      }
    })

    expect(wrapper.html()).toMatchSnapshot()

    wrapper.find('.v-treeview-node__toggle')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should load children when selecting, but not render', async () => {
    const loadChildren = (item) => {
      item.children = [{ id: 1, name: 'Child' }]
    }

    const wrapper = mount(VTreeview, {
      propsData: {
        items: [{ id: 0, name: 'Root', children: [] }],
        selectable: true,
        loadChildren
      }
    })

    const fn = jest.fn()
    wrapper.vm.$on('change', fn)

    expect(wrapper.html()).toMatchSnapshot()

    wrapper.find('.v-treeview-node__checkbox')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith([0, 1])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should emit active node when clicking on it', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: [{ id: 0, name: 'Root' }, { id: 1, name: 'Root' }],
        activatable: true
      }
    })

    const fn = jest.fn()
    wrapper.vm.$on('update:active', fn)

    wrapper.find('.v-treeview-node__root')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith([0])

    wrapper.find('.v-treeview-node__root')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(fn).toHaveBeenCalledWith([])
  })

  it('should allow multiple active nodes with prop multipleActive', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: [{ id: 0, name: 'Root' }, { id: 1, name: 'Root' }],
        multipleActive: true,
        activatable: true
      }
    })

    const fn = jest.fn()
    wrapper.vm.$on('update:active', fn)

    wrapper.find('.v-treeview-node__root').forEach(vm => vm.trigger('click'))
    await wrapper.vm.$nextTick()

    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith([0, 1])
  })

  it('should update selection when selected prop changes', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: [{ id: 0, name: 'Root', children: [{ id: 1, name: 'Child' }] }],
        value: []
      }
    })

    expect(wrapper.html()).toMatchSnapshot()

    wrapper.find('.v-treeview-node__toggle')[0].trigger('click')
    wrapper.setProps({ value: [1] })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.v-treeview-node').length).toBe(2)
    expect(wrapper.find('.v-treeview-node--selected').length).toBe(2)
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setProps({ value: undefined })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should open all children when using open-all prop', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: threeLevels,
        openAll: true
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should react to open changes', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: threeLevels,
        open: [1]
      }
    })

    wrapper.setProps({ open: [0, 1]})

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setProps({ open: [0] })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setProps({ open: [0, 1] })

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()

    expect(wrapper.vm.openCache).toEqual([0, 1])

    // Should not update open values that do not exist in the tree
    wrapper.setProps({ open: [7] })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatchSnapshot()

    expect(wrapper.vm.openCache).toEqual([])
  })

  it('should update selected and active on created', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: threeLevels,
        active: [2],
        value: [1]
      }
    })

    expect(wrapper.vm.activeCache).toEqual([2])
    expect(wrapper.vm.selectedCache).toEqual([1, 2])
  })

  it('should react to changes for value, selected and activated', async () => {
    const wrapper = mount(VTreeview, {
      propsData: {
        items: threeLevels,
        active: [2],
        value: [1]
      }
    })

    wrapper.setProps({ active: [0] })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeCache).toEqual([0])

    // Should not update values that do not exist in the tree

    wrapper.setProps({ active: [7], value: [7] })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeCache).toEqual([])
    expect(wrapper.vm.selectedCache).toEqual([1, 2])

    // Should rebuild tree and reuse cached values

    wrapper.setProps({ active: [0], items: singleRootTwoChildren })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeCache).toEqual([0])
    expect(wrapper.vm.selectedCache).toEqual([1, 2, 0])
  })

  it('should accept string value for id', async () => {
    const wrapper = mount(VTreeview, {
      propsData: { itemKey: 'name' }
    })

    wrapper.setProps({ items: [{ name: 'Foobar' }]})

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.nodes['Foobar']).toBeTruthy()

    wrapper.setProps({ value: ['Foobar'] })

    await wrapper.vm.$nextTick()
  })

  it('should warn developer when using non-scoped slots', () => {
    const wrapper = mount(VTreeview, {
      slots: {
        prepend: [{ render: h => h('div') }],
        append: [{ render: h => h('div') }]
      }
    })

    expect('[Vuetify] The prepend and append slots require a slot-scope attribute').toHaveBeenTipped()
  })
})