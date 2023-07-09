import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import TrackingView from '../views/TrackingView.vue'

import WorkOrdersIndexView from '../views/work-orders/WorkOrdersIndexView.vue'
import WorkOrdersCreateView from '../views/work-orders/WorkOrdersCreateView.vue'
import WorkOrdersSearchView from '../views/work-orders/WorkOrdersSearchView.vue'

import ShopfloorsIndexView from '../views/shopfloors/ShopfloorsIndexView.vue'
import ShopfloorsCreateView from '../views/shopfloors/ShopfloorsCreateView.vue'
import ShopfloorsShowView from '../views/shopfloors/ShopfloorsShowView.vue'
import ShopfloorsEditView from '../views/shopfloors/ShopfloorsEditView.vue'

import GraphsView from '../views/GraphsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/tracking',
      name: 'tracking',
      component: TrackingView
    },
    {
      path: '/search',
      name: 'work-orders.search',
      component: WorkOrdersSearchView
    },
    {
      path: '/work-orders',
      name: 'work-orders',
      component: WorkOrdersIndexView
    },
    {
      path: '/input-work-order',
      name: 'work-orders.create',
      component: WorkOrdersCreateView
    },
    {
      path: '/shopfloors',
      name: 'shopfloors',
      component: ShopfloorsIndexView
    },
    {
      path: '/shopfloors/create',
      name: 'shopfloors.create',
      component: ShopfloorsCreateView
    },
    {
      path: '/shopfloors/:id',
      name: 'shopfloors.show',
      component: ShopfloorsShowView
    },
    {
      path: '/shopfloors/:id/edit',
      name: 'shopfloors.edit',
      component: ShopfloorsEditView
    },
    {
      path: '/graphs',
      name: 'graphs',
      component: GraphsView
    }
  ]
})

export default router
